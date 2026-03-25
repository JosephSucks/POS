import { sql } from "@/lib/db"
import { AuthUser } from "@/lib/auth"

export interface AccessRequest {
  id: number
  requester_id: number
  requester_name?: string
  requester_email?: string
  request_reason: string | null
  status: "pending" | "approved" | "denied" | "expired"
  requested_at: string
  responded_at: string | null
  responded_by: number | null
  responder_name?: string
  expires_at: string | null
}

/**
 * Check if manager access control is enabled
 */
export async function isManagerAccessControlEnabled(): Promise<boolean> {
  try {
    const result = await sql`
      SELECT value FROM settings WHERE key = 'managerAccessControl'
    `
    if (result.length === 0) return true // Default to ON
    const setting = JSON.parse(result[0].value as string)
    return setting === "ON" || setting === true
  } catch {
    return true // Default to ON if error
  }
}

/**
 * Get active temporary access grant for a manager
 * Returns the access grant if it exists and hasn't expired
 */
export async function getActiveTemporaryAccess(
  managerId: number
): Promise<AccessRequest | null> {
  try {
    const result = await sql`
      SELECT 
        id, requester_id, request_reason, status,
        requested_at, responded_at, responded_by, expires_at
      FROM admin_access_requests
      WHERE requester_id = ${managerId}
        AND status = 'approved'
        AND expires_at > NOW()
      ORDER BY expires_at DESC
      LIMIT 1
    `
    if (result.length === 0) return null
    return result[0] as AccessRequest
  } catch (error) {
    console.error("Failed to get active temporary access:", error)
    return null
  }
}

/**
 * Check if a manager has active temporary admin access
 */
export async function hasTemporaryAdminAccess(managerId: number): Promise<boolean> {
  const access = await getActiveTemporaryAccess(managerId)
  return access !== null
}

/**
 * Helper function to check if a user can access admin
 * Returns true if:
 * - User is admin, OR
 * - User is manager AND (access control is OFF OR has active temporary access)
 */
export async function canAccessAdmin(user: AuthUser): Promise<boolean> {
  if (user.role === "admin") {
    return true
  }

  if (user.role === "manager") {
    const controlEnabled = await isManagerAccessControlEnabled()
    if (!controlEnabled) {
      return true // Control is OFF, allow direct access
    }

    // Control is ON, check for active temporary access
    return await hasTemporaryAdminAccess(user.id)
  }

  return false
}

/**
 * Create a new access request
 */
export async function createAccessRequest(
  managerId: number,
  reason?: string
): Promise<AccessRequest | null> {
  try {
    const result = await sql`
      INSERT INTO admin_access_requests (requester_id, request_reason, status, requested_at, created_at, updated_at)
      VALUES (${managerId}, ${reason || null}, 'pending', NOW(), NOW(), NOW())
      RETURNING 
        id, requester_id, request_reason, status,
        requested_at, responded_at, responded_by, expires_at
    `
    return result[0] as AccessRequest
  } catch (error) {
    console.error("Failed to create access request:", error)
    return null
  }
}

/**
 * Get pending access requests
 */
export async function getPendingAccessRequests(): Promise<AccessRequest[]> {
  try {
    const result = await sql`
      SELECT 
        aar.id, aar.requester_id, aar.request_reason, aar.status,
        aar.requested_at, aar.responded_at, aar.responded_by, aar.expires_at,
        e.name as requester_name, e.email as requester_email
      FROM admin_access_requests aar
      LEFT JOIN employees e ON aar.requester_id = e.id
      WHERE aar.status = 'pending'
      ORDER BY aar.requested_at DESC
    `
    return result as AccessRequest[]
  } catch (error) {
    console.error("Failed to get pending access requests:", error)
    return []
  }
}

/**
 * Get access request by ID with requester and responder details
 */
export async function getAccessRequestById(id: number): Promise<AccessRequest | null> {
  try {
    const result = await sql`
      SELECT 
        aar.id, aar.requester_id, aar.request_reason, aar.status,
        aar.requested_at, aar.responded_at, aar.responded_by, aar.expires_at,
        e.name as requester_name, e.email as requester_email,
        responder.name as responder_name
      FROM admin_access_requests aar
      LEFT JOIN employees e ON aar.requester_id = e.id
      LEFT JOIN employees responder ON aar.responded_by = responder.id
      WHERE aar.id = ${id}
    `
    if (result.length === 0) return null
    return result[0] as AccessRequest
  } catch (error) {
    console.error("Failed to get access request:", error)
    return null
  }
}

/**
 * Get access request history for a manager
 */
export async function getAccessRequestHistory(
  managerId: number,
  limit = 10
): Promise<AccessRequest[]> {
  try {
    const result = await sql`
      SELECT 
        aar.id, aar.requester_id, aar.request_reason, aar.status,
        aar.requested_at, aar.responded_at, aar.responded_by, aar.expires_at,
        responder.name as responder_name
      FROM admin_access_requests aar
      LEFT JOIN employees responder ON aar.responded_by = responder.id
      WHERE aar.requester_id = ${managerId}
      ORDER BY aar.requested_at DESC
      LIMIT ${limit}
    `
    return result as AccessRequest[]
  } catch (error) {
    console.error("Failed to get access request history:", error)
    return []
  }
}

/**
 * Approve an access request
 */
export async function approveAccessRequest(
  requestId: number,
  adminId: number
): Promise<AccessRequest | null> {
  try {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    const result = await sql`
      UPDATE admin_access_requests
      SET 
        status = 'approved',
        responded_by = ${adminId},
        responded_at = NOW(),
        expires_at = ${expiresAt.toISOString()},
        updated_at = NOW()
      WHERE id = ${requestId}
      RETURNING 
        id, requester_id, request_reason, status,
        requested_at, responded_at, responded_by, expires_at
    `
    if (result.length === 0) return null
    return result[0] as AccessRequest
  } catch (error) {
    console.error("Failed to approve access request:", error)
    return null
  }
}

/**
 * Deny an access request
 */
export async function denyAccessRequest(adminId: number, requestId: number): Promise<AccessRequest | null> {
  try {
    const result = await sql`
      UPDATE admin_access_requests
      SET 
        status = 'denied',
        responded_by = ${adminId},
        responded_at = NOW(),
        updated_at = NOW()
      WHERE id = ${requestId}
      RETURNING 
        id, requester_id, request_reason, status,
        requested_at, responded_at, responded_by, expires_at
    `
    if (result.length === 0) return null
    return result[0] as AccessRequest
  } catch (error) {
    console.error("Failed to deny access request:", error)
    return null
  }
}

/**
 * Get pending request count for a manager
 */
export async function getPendingRequestCount(managerId: number): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM admin_access_requests
      WHERE requester_id = ${managerId} AND status = 'pending'
    `
    return (result[0]?.count as number) || 0
  } catch {
    return 0
  }
}

/**
 * Get total pending request count for admins
 */
export async function getTotalPendingRequestCount(): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM admin_access_requests
      WHERE status = 'pending'
    `
    return (result[0]?.count as number) || 0
  } catch {
    return 0
  }
}

/**
 * Mark expired access requests (runs on-demand)
 */
export async function markExpiredAccessRequests(): Promise<number> {
  try {
    const result = await sql`
      UPDATE admin_access_requests
      SET status = 'expired', updated_at = NOW()
      WHERE status = 'approved' AND expires_at <= NOW()
    `
    return (result?.count as number) || 0
  } catch (error) {
    console.error("Failed to mark expired access requests:", error)
    return 0
  }
}
