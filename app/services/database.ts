import { neon } from '@neondatabase/serverless'
import type { Product } from "../context/cart-context"

// Database service for Neon PostgreSQL
// Try multiple environment variable names for database connection
const getDatabaseUrl = () => {
  const url = 
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED

  if (!url) {
    console.error('[v0] DATABASE_URL not found. Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES')))
    throw new Error('No database connection string found. Set DATABASE_URL, POSTGRES_URL, or POSTGRES_URL_NON_POOLING environment variable.')
  }

  console.log('[v0] Using database URL:', url.substring(0, 30) + '...')
  return url
}

const sql = neon(getDatabaseUrl())

export interface Customer {
  id?: number
  name: string
  email?: string
  phone?: string
  loyaltyPoints?: number
  totalSpent?: number
  createdAt?: Date
}

export interface Transaction {
  id?: number
  customerId?: number
  items: Array<{
    id: number
    name: string
    price: number
    quantity: number
    total: number
  }>
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: string
  timestamp?: Date
}

export interface InventoryItem extends Product {
  stock: number
  lowStockThreshold: number
}

class DatabaseService {
  async getCustomers(): Promise<Customer[]> {
    try {
      const customers = await sql`SELECT * FROM customers ORDER BY created_at DESC`
      return customers as Customer[]
    } catch (error) {
      console.error('[v0] Error fetching customers:', error)
      return []
    }
  }

  async getCustomer(id: number): Promise<Customer | null> {
    try {
      const result = await sql`SELECT * FROM customers WHERE id = ${id}`
      return result[0] as Customer || null
    } catch (error) {
      console.error('[v0] Error fetching customer:', error)
      return null
    }
  }

  async saveCustomer(customer: Customer): Promise<Customer> {
    try {
      if (customer.id) {
        const result = await sql`
          UPDATE customers 
          SET name = ${customer.name}, 
              email = ${customer.email}, 
              phone = ${customer.phone}
          WHERE id = ${customer.id}
          RETURNING *
        `
        return result[0] as Customer
      } else {
        const result = await sql`
          INSERT INTO customers (name, email, phone)
          VALUES (${customer.name}, ${customer.email}, ${customer.phone})
          RETURNING *
        `
        return result[0] as Customer
      }
    } catch (error) {
      console.error('[v0] Error saving customer:', error)
      throw error
    }
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    try {
      const searchTerm = `%${query}%`
      const customers = await sql`
        SELECT * FROM customers 
        WHERE name ILIKE ${searchTerm} 
           OR email ILIKE ${searchTerm} 
           OR phone ILIKE ${searchTerm}
        ORDER BY created_at DESC
      `
      return customers as Customer[]
    } catch (error) {
      console.error('[v0] Error searching customers:', error)
      return []
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    try {
      const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`
      
      const transactions: Transaction[] = []
      for (const order of orders) {
        const items = await sql`
          SELECT oi.id, p.name, oi.unit_price as price, oi.quantity, oi.subtotal as total
          FROM order_items oi
          JOIN products p ON p.id = oi.product_id
          WHERE oi.order_id = ${order.id}
        `
        
        transactions.push({
          id: order.id,
          customerId: order.customer_id,
          items: items as any,
          subtotal: order.subtotal || 0,
          tax: order.tax || 0,
          discount: order.discount || 0,
          total: order.total || 0,
          paymentMethod: order.payment_method || 'unknown',
          timestamp: new Date(order.created_at),
        })
      }
      
      return transactions
    } catch (error) {
      console.error('[v0] Error fetching transactions:', error)
      return []
    }
  }

  async saveTransaction(transaction: Transaction): Promise<void> {
    try {
      const result = await sql`
        INSERT INTO orders (customer_id, subtotal, discount, tax, total, payment_method, status)
        VALUES (${transaction.customerId || null}, ${transaction.subtotal}, ${transaction.discount}, ${transaction.tax}, ${transaction.total}, ${transaction.paymentMethod}, 'completed')
        RETURNING id
      `
      
      const orderId = result[0].id
      
      for (const item of transaction.items) {
        await sql`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
          VALUES (${orderId}, ${item.id}, ${item.quantity}, ${item.price}, ${item.total})
        `
      }

      for (const item of transaction.items) {
        await sql`
          UPDATE products 
          SET stock = stock - ${item.quantity}, stock_updated_at = NOW()
          WHERE id = ${item.id}
        `
      }
    } catch (error) {
      console.error('[v0] Error saving transaction:', error)
      throw error
    }
  }

  async getTransactionsByCustomer(customerId: number): Promise<Transaction[]> {
    try {
      const orders = await sql`SELECT * FROM orders WHERE customer_id = ${customerId} ORDER BY created_at DESC`
      
      const transactions: Transaction[] = []
      for (const order of orders) {
        const items = await sql`
          SELECT oi.id, p.name, oi.unit_price as price, oi.quantity, oi.subtotal as total
          FROM order_items oi
          JOIN products p ON p.id = oi.product_id
          WHERE oi.order_id = ${order.id}
        `
        
        transactions.push({
          id: order.id,
          customerId: order.customer_id,
          items: items as any,
          subtotal: order.subtotal || 0,
          tax: order.tax || 0,
          discount: order.discount || 0,
          total: order.total || 0,
          paymentMethod: order.payment_method || 'unknown',
          timestamp: new Date(order.created_at),
        })
      }
      
      return transactions
    } catch (error) {
      console.error('[v0] Error fetching customer transactions:', error)
      return []
    }
  }

  async getInventory(): Promise<InventoryItem[]> {
    try {
      const result = await sql`
        SELECT p.id, p.name, p.price, p.image_url as image, c.name as category, 
               p.stock, p.reorder_level as lowStockThreshold
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id
      `
      return result as any
    } catch (error) {
      console.error('[v0] Error fetching inventory:', error)
      return []
    }
  }

  async updateStock(productId: number, quantity: number): Promise<void> {
    try {
      await sql`
        UPDATE products 
        SET stock = stock - ${quantity}, stock_updated_at = NOW()
        WHERE id = ${productId}
      `
    } catch (error) {
      console.error('[v0] Error updating stock:', error)
      throw error
    }
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      const result = await sql`
        SELECT p.id, p.name, p.price, p.image_url as image, c.name as category, 
               p.stock, p.reorder_level as lowStockThreshold
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.stock <= p.reorder_level
        ORDER BY p.stock ASC
      `
      return result as any
    } catch (error) {
      console.error('[v0] Error fetching low stock items:', error)
      return []
    }
  }

  async generateSalesReport(startDate: Date, endDate: Date) {
    try {
      const result = await sql`
        SELECT 
          SUM(o.total) as totalSales,
          COUNT(o.id) as totalTransactions,
          AVG(o.total) as averageTransaction
        FROM orders o
        WHERE o.created_at >= ${startDate} AND o.created_at <= ${endDate}
      `
      
      const topProducts = await sql`
        SELECT p.id, p.name, SUM(oi.quantity) as quantity, SUM(oi.subtotal) as revenue
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        JOIN orders o ON o.id = oi.order_id
        WHERE o.created_at >= ${startDate} AND o.created_at <= ${endDate}
        GROUP BY p.id, p.name
        ORDER BY revenue DESC
        LIMIT 10
      `
      
      return {
        date: new Date().toISOString().split("T")[0],
        totalSales: result[0]?.totalSales || 0,
        totalTransactions: result[0]?.totalTransactions || 0,
        averageTransaction: result[0]?.averageTransaction || 0,
        topProducts: topProducts as any,
      }
    } catch (error) {
      console.error('[v0] Error generating sales report:', error)
      return {
        date: new Date().toISOString().split("T")[0],
        totalSales: 0,
        totalTransactions: 0,
        averageTransaction: 0,
        topProducts: [],
      }
    }
  }
}

export const db = new DatabaseService()
