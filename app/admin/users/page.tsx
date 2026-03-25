"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Loader2, Pencil, Plus, Power, Shield, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

const roleOptions = ["admin", "manager", "cashier"] as const
const statusOptions = ["active", "inactive"] as const

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  role: z.enum(roleOptions),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const editUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  role: z.enum(roleOptions),
  status: z.enum(statusOptions),
})

type UserRole = (typeof roleOptions)[number]
type UserStatus = (typeof statusOptions)[number]

type UserRecord = {
  id: number
  name: string
  email: string
  role: UserRole
  status: UserStatus
  created_at: string
}

type CreateUserValues = z.infer<typeof createUserSchema>
type EditUserValues = z.infer<typeof editUserSchema>

const getErrorMessage = async (response: Response) => {
  const data = await response.json().catch(() => null)
  return data?.error || "Something went wrong"
}

const roleBadgeClassName: Record<UserRole, string> = {
  admin: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-300",
  manager: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-300",
  cashier: "bg-gray-500/10 text-gray-700 border-gray-500/20 dark:text-gray-300",
}

const statusBadgeClassName: Record<UserStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300",
  inactive: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300",
}

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)

  const createForm = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "cashier",
      password: "",
    },
  })

  const editForm = useForm<EditUserValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "cashier",
      status: "active",
    },
  })

  const loadUsers = async () => {
    setLoading(true)
    setPageError(null)

    try {
      const response = await fetch("/api/users", { credentials: "include" })
      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      const data = await response.json()
      setUsers(Array.isArray(data.users) ? data.users : [])
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load users"
      setPageError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (!editingUser) {
      editForm.reset({
        name: "",
        email: "",
        role: "cashier",
        status: "active",
      })
      return
    }

    editForm.reset({
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role,
      status: editingUser.status,
    })
  }, [editingUser, editForm])

  const handleCreateUser = async (values: CreateUserValues) => {
    setIsSubmittingCreate(true)
    createForm.clearErrors("root")

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        createForm.setError("root", { message: await getErrorMessage(response) })
        return
      }

      setIsCreateOpen(false)
      createForm.reset({
        name: "",
        email: "",
        role: "cashier",
        password: "",
      })
      await loadUsers()
      toast({
        title: "User created",
        description: "The staff account has been added.",
      })
    } catch (error) {
      createForm.setError("root", {
        message: error instanceof Error ? error.message : "Failed to create user",
      })
    } finally {
      setIsSubmittingCreate(false)
    }
  }

  const handleEditUser = async (values: EditUserValues) => {
    if (!editingUser) {
      return
    }

    setIsSubmittingEdit(true)
    editForm.clearErrors("root")

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        editForm.setError("root", { message: await getErrorMessage(response) })
        return
      }

      setEditingUser(null)
      await loadUsers()
      toast({
        title: "User updated",
        description: "The staff account has been updated.",
      })
    } catch (error) {
      editForm.setError("root", {
        message: error instanceof Error ? error.message : "Failed to update user",
      })
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  const handleToggleStatus = async (user: UserRecord) => {
    setTogglingUserId(user.id)

    try {
      const nextStatus: UserStatus = user.status === "active" ? "inactive" : "active"
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      await loadUsers()
      toast({
        title: nextStatus === "active" ? "User reactivated" : "User deactivated",
        description: `${user.name} is now ${nextStatus}.`,
      })
    } catch (error) {
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setTogglingUserId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage staff accounts, roles, and access status.</p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create user
        </Button>
      </div>

      {pageError && (
        <Alert variant="destructive">
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total staff</CardDescription>
            <CardTitle>{users.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active accounts</CardDescription>
            <CardTitle>{users.filter((user) => user.status === "active").length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Admins</CardDescription>
            <CardTitle>{users.filter((user) => user.role === "admin").length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff directory
          </CardTitle>
          <CardDescription>Only non-sensitive user fields are shown here.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              No staff accounts found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleBadgeClassName[user.role]}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClassName[user.status]}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(user.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(user)}
                          disabled={togglingUserId === user.id}
                        >
                          {togglingUserId === user.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Power className="mr-2 h-4 w-4" />
                          )}
                          {user.status === "active" ? "Deactivate" : "Reactivate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create user</DialogTitle>
            <DialogDescription>Add a new staff member with a secure password.</DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateUser)} className="space-y-4">
              {createForm.formState.errors.root?.message && (
                <Alert variant="destructive">
                  <AlertDescription>{createForm.formState.errors.root.message}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" disabled={isSubmittingCreate} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jane@company.com" disabled={isSubmittingCreate} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isSubmittingCreate}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Minimum 8 characters" disabled={isSubmittingCreate} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmittingCreate}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingCreate}>
                  {isSubmittingCreate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                  Create user
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>Update account details, role, or active status.</DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditUser)} className="space-y-4">
              {editForm.formState.errors.root?.message && (
                <Alert variant="destructive">
                  <AlertDescription>{editForm.formState.errors.root.message}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input disabled={isSubmittingEdit} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" disabled={isSubmittingEdit} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={editForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isSubmittingEdit}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isSubmittingEdit}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)} disabled={isSubmittingEdit}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingEdit}>
                  {isSubmittingEdit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil className="mr-2 h-4 w-4" />}
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
