# POS System Database ERD (Entity Relationship Diagram)

## Visual Entity Relationship Diagram

```mermaid
erDiagram
    CATEGORIES ||--o{ PRODUCTS : contains
    PRODUCTS ||--|| INVENTORY : has
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered in"
    CATEGORIES {
        int id PK
        string name UK
        string description
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCTS {
        int id PK
        int category_id FK
        string name
        decimal price
        string image_url
        timestamp created_at
        timestamp updated_at
    }
    
    INVENTORY {
        int id PK
        int product_id FK UK
        int quantity
        int reorder_level
        timestamp last_restocked
        timestamp created_at
        timestamp updated_at
    }
    
    CUSTOMERS {
        int id PK
        string name
        string email UK
        string phone
        int loyalty_points
        decimal total_spent
        timestamp created_at
        timestamp updated_at
    }
    
    ORDERS {
        int id PK
        int customer_id FK
        decimal subtotal
        decimal discount
        decimal tax
        decimal total
        string payment_method
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
        decimal subtotal
        timestamp created_at
    }
    
    CUSTOMERS ||--o{ ORDERS : places
    ORDERS ||--o{ ORDER_ITEMS : contains
```

## Table Relationships Overview

### Core Product Management
| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| **categories** | Product categories (Food, Drinks, Desserts) | One category → Many products |
| **products** | All menu items with pricing | One category → Many products; One product → One inventory |
| **inventory** | Stock levels per product | One product → One inventory |

### Sales & Orders
| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| **customers** | Customer information | One customer → Many orders |
| **orders** | Transaction records | One order → Many order items |
| **order_items** | Individual items in each order | One order → Many items; Many items → One product |

## Detailed Schema

### categories
```
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR(255), UNIQUE)
- description (TEXT, nullable)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
```

### products
```
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- category_id (INT, FOREIGN KEY → categories.id)
- name (VARCHAR(255))
- price (DECIMAL(10,2))
- image_url (VARCHAR(255), nullable)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
```

### inventory
```
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- product_id (INT, FOREIGN KEY → products.id, UNIQUE)
- quantity (INT, DEFAULT 0)
- reorder_level (INT, DEFAULT 10)
- last_restocked (TIMESTAMP, nullable)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
```

### customers
```
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR(255))
- email (VARCHAR(255), UNIQUE, nullable)
- phone (VARCHAR(20), nullable)
- loyalty_points (INT, DEFAULT 0)
- total_spent (DECIMAL(12,2), DEFAULT 0)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
```

### orders
```
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- customer_id (INT, FOREIGN KEY → customers.id, nullable)
- subtotal (DECIMAL(10,2))
- discount (DECIMAL(10,2), DEFAULT 0)
- tax (DECIMAL(10,2))
- total (DECIMAL(10,2))
- payment_method (VARCHAR(50)) [cash, card, mobile]
- status (VARCHAR(50), DEFAULT 'completed') [completed, pending, cancelled]
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
```

### order_items
```
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- order_id (INT, FOREIGN KEY → orders.id)
- product_id (INT, FOREIGN KEY → products.id)
- quantity (INT)
- unit_price (DECIMAL(10,2))
- subtotal (DECIMAL(10,2))
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
```

## Key Relationships Explained

### One-to-Many Relationships
1. **Categories → Products** (1:M)
   - One category can have many products
   - Example: "Food" category has Burger, Pizza, Salad

2. **Products → Inventory** (1:1)
   - Each product has exactly one inventory record
   - Tracks stock levels for each product

3. **Customers → Orders** (1:M)
   - One customer can place many orders
   - Orders can also be anonymous (NULL customer_id)

4. **Orders → Order Items** (1:M)
   - One order contains many items
   - Each item links to a product and quantity

### How Data Flows

#### Creating an Order
```
Customer → Order (with customer_id)
         ↓
      Order Items (links to Products)
         ↓
      Inventory (quantity decremented)
```

#### Querying Sales Data
```
Orders (filter by date range)
   ↓
Order Items (calculate totals)
   ↓
Products (get names and details)
```

#### Inventory Management
```
Products → Inventory → Check reorder_level
              ↓
         If quantity ≤ reorder_level
              ↓
         Alert for restocking
```

## Sample Queries

### Get all orders with customer details
```sql
SELECT o.id, c.name, o.total, o.payment_method, o.created_at
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
ORDER BY o.created_at DESC;
```

### Get all items in an order
```sql
SELECT oi.id, p.name, oi.quantity, oi.unit_price, oi.subtotal
FROM order_items oi
JOIN products p ON oi.product_id = p.id
WHERE oi.order_id = ?;
```

### Get low stock items
```sql
SELECT p.id, p.name, i.quantity, i.reorder_level
FROM products p
JOIN inventory i ON p.id = i.product_id
WHERE i.quantity <= i.reorder_level
ORDER BY i.quantity ASC;
```

### Get sales by category
```sql
SELECT c.name, COUNT(*) as items_sold, SUM(oi.subtotal) as revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN categories c ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY revenue DESC;
```

### Get customer loyalty stats
```sql
SELECT c.id, c.name, COUNT(o.id) as order_count, 
       c.total_spent, c.loyalty_points
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id
ORDER BY c.total_spent DESC;
```

## Database Constraints & Integrity

| Constraint | Purpose |
|-----------|---------|
| PRIMARY KEY (id) | Unique identifier for each record |
| FOREIGN KEY | Maintains referential integrity between tables |
| UNIQUE (name, email, phone) | Prevents duplicate entries |
| NOT NULL | Ensures required fields are always present |
| DEFAULT values | Auto-fills common values |
| DECIMAL precision | Accurate financial calculations |

## Notes for Development

- Use transactions when inserting orders with multiple items to ensure atomicity
- Always decrement inventory when an order is created
- Consider archiving old orders for performance
- Regularly backup the database
- Index frequently queried columns (customer_id, product_id, created_at)
- Use prepared statements to prevent SQL injection
