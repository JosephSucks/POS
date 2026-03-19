## Prisma Setup Guide

Your POS system now uses **Prisma** as the ORM (Object-Relational Mapping) layer with Neon PostgreSQL. Here's how to complete the setup:

### Step 1: Install Dependencies

After downloading the project, run:

```bash
pnpm install
```

This installs both `@prisma/client` and `prisma` (CLI).

### Step 2: Environment Variables

Ensure your `.env.local` file contains your Neon database connection string:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

You can find this in your Neon dashboard under **Connection String**.

### Step 3: Initialize Prisma

The Prisma schema is already created at `prisma/schema.prisma`. To sync it with your database:

```bash
npx prisma migrate dev --name init
```

This command:
- Creates any missing tables based on the schema
- Generates the Prisma client
- Seeds your database if needed

### Step 4: Generate Prisma Client

If needed, manually generate the Prisma client:

```bash
npx prisma generate
```

### Step 5: Start Development Server

```bash
pnpm dev
```

Your app will now use Prisma for all database operations!

### Useful Prisma Commands

```bash
# View your database in a visual editor
npx prisma studio

# Create a new migration
npx prisma migrate dev --name add_new_field

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Format your schema file
npx prisma format
```

### Database Schema Overview

Your Prisma schema includes:

- **Categories**: Product categories
- **Products**: Menu items with pricing
- **Inventory**: Stock levels and reorder points
- **Customers**: Customer information and loyalty points
- **Orders**: Sales transactions
- **OrderItems**: Individual items in each order

### Benefits of Prisma

✅ **Type-safe**: Full TypeScript support with autocomplete  
✅ **Readable**: Schema is easy to understand and modify  
✅ **Migrations**: Version control for database changes  
✅ **Built-in tools**: Prisma Studio for database exploration  
✅ **Performance**: Automatic query optimization  

### Adding New Fields

To add a new field to your database:

1. Update the schema in `prisma/schema.prisma`
2. Run: `npx prisma migrate dev --name describe_change`
3. Update your TypeScript interfaces to match

Example - Add a description field to products:

```prisma
model Product {
  id          Int       @id @default(autoincrement())
  name        String    @unique
  description String?   // New field
  price       Decimal   @db.Decimal(10, 2)
  // ... rest of fields
}
```

Then run the migration command above.

### Troubleshooting

**"Can't reach database server"** - Check your DATABASE_URL is correct  
**"PrismaClientInitializationError"** - Run `npx prisma generate`  
**"Migration failed"** - Check for conflicts with existing schema  

For more help, visit [Prisma Documentation](https://www.prisma.io/docs/)
