# TypeScript Monorepo - React + Express.js + Supabase

Modern full-stack TypeScript application with React frontend, Express.js backend, and Supabase PostgreSQL database integration.

## 🚀 Features

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: Supabase PostgreSQL
- **Development**: Hot reload, TypeScript type checking
- **UI**: Modern design with Shadcn/ui components

## 📋 Requirements

- Node.js 18+ 
- npm or pnpm
- Supabase account

## 🛠️ Setup

### 1. Clone the project and install dependencies

```bash
# Install dependencies
npm install
```

### 2. Supabase Setup

#### Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Create a new project
3. Wait for the project to be ready

#### Get Supabase Credentials
1. In your project dashboard, go to **Settings** > **API**
2. Copy the **Project URL** and **anon public key**
3. Also get the **Database URL** from **Settings** > **Database** > **Connection string** > **Transaction pooler**

#### Enable Email Authentication
1. Go to **Authentication** > **Settings**
2. Under **Site URL**, add your development URL (e.g., `http://localhost:5000`)
3. Under **Auth Providers**, make sure **Email** is enabled
4. Configure email templates if needed

#### Create Profiles Table
Run this SQL in the **SQL Editor** of your Supabase dashboard:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Toptancı', 'Alıcı')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Allow anyone to insert a profile (needed for registration)
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Create Products Table
Run this SQL in the **SQL Editor** of your Supabase dashboard:

```sql
-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT DEFAULT 'https://via.placeholder.com/300x200',
  created_by UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read products (for buyers)
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);

-- Allow users to insert their own products (for suppliers)
CREATE POLICY "Users can insert own products" ON products FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own products
CREATE POLICY "Users can update own products" ON products FOR UPDATE USING (auth.uid() = created_by);

-- Allow users to delete their own products
CREATE POLICY "Users can delete own products" ON products FOR DELETE USING (auth.uid() = created_by);

-- Create trigger for automatic updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Create Orders Table
Run this SQL in the **SQL Editor** of your Supabase dashboard:

```sql
-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status TEXT NOT NULL DEFAULT 'Beklemede' CHECK (status IN ('Beklemede', 'Hazırlanıyor', 'Teslim Edildi')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow buyers to view their own orders
CREATE POLICY "Buyers can view own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id);

-- Allow sellers to view orders for their products
CREATE POLICY "Sellers can view orders for their products" ON orders FOR SELECT USING (auth.uid() = seller_id);

-- Allow buyers to insert orders
CREATE POLICY "Buyers can insert orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Allow sellers to update order status
CREATE POLICY "Sellers can update order status" ON orders FOR UPDATE USING (auth.uid() = seller_id);

-- Create indexes for better performance
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### 3. Environment Variables Setup

```bash
# Copy environment variables template
cp .env.example .env
