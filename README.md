# 📚 IT Literature Shop Backend API

Backend API untuk sistem toko buku literatur IT yang dibangun dengan Express.js, TypeScript, PostgreSQL, dan Prisma ORM. API ini menyediakan endpoint untuk manajemen pengguna, genre, buku, dan transaksi dengan fitur autentikasi JWT dan soft delete.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon Database)
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Custom middleware
- **CORS**: Enabled for cross-origin requests

## 📋 Features

### 🔐 Authentication & Authorization
- User registration dengan email dan password
- User login dengan JWT token
- Protected routes dengan Bearer token authentication
- Password hashing dengan bcryptjs
- Token expiration (7 hari)

### 📖 Book Management
- CRUD operations untuk buku
- Soft delete untuk data integrity
- Search dan filtering berdasarkan title, writer, publisher
- Pagination untuk performa optimal
- Sorting berdasarkan berbagai field
- Price range filtering
- Genre-based filtering

### 🏷️ Genre Management
- CRUD operations untuk genre
- Soft delete dengan validasi relasi
- Search dan filtering
- Pagination dan sorting
- Validasi untuk mencegah duplikasi

### 🛒 Transaction Management
- Multi-item transaction support
- Stock validation dan update
- Transaction history per user
- Transaction statistics
- Atomic operations dengan Prisma transactions

### 🔍 Advanced Features
- Comprehensive search functionality
- Pagination dengan metadata
- Sorting dengan multiple fields
- Error handling yang konsisten
- Input validation
- Soft delete untuk data integrity
- Transaction statistics

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT,
  password TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);
```

### Genres Table
```sql
CREATE TABLE genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ(3)
);
```

### Books Table
```sql
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT UNIQUE NOT NULL,
  writer TEXT NOT NULL,
  publisher TEXT NOT NULL,
  publication_year INTEGER NOT NULL,
  description TEXT,
  price DOUBLE PRECISION NOT NULL,
  stock_quantity INTEGER NOT NULL,
  genre_id UUID NOT NULL REFERENCES genres(id),
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ(3)
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quantity INTEGER NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id),
  book_id UUID NOT NULL REFERENCES books(id),
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT now()
);
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 atau lebih baru)
- PostgreSQL database (Neon Database)
- npm atau yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd it-literature-shop-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Buat file `.env` di root directory:
```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Server
PORT=8080
NODE_ENV=development
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema ke database
npm run db:push

# Atau jalankan migration
npm run db:migrate
```

### 5. Start Development Server
```bash
npm run dev
```

Server akan berjalan di `http://localhost:8080`

## 📚 API Documentation

### Base URL
```
http://localhost:8080
```

### Response Format
Semua response mengikuti format konsisten:
```json
{
  "success": true|false,
  "message": "string",
  "data": {}|[]|undefined
}
```

## 🔐 Authentication Endpoints

### POST /auth/register
Mendaftarkan user baru.

**Request Body:**
```json
{
  "username": "Mr. Dummy", // Optional
  "email": "dummy@gmail.com",
  "password": "Dummy.12345"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "7d25ce36-54af-448c-8a15-f487764c8d83",
    "email": "dummy@gmail.com",
    "created_at": "2025-07-20T00:24:16.113Z"
  }
}
```

### POST /auth/login
Login user dan mendapatkan access token.

**Request Body:**
```json
{
  "email": "dummy@gmail.com",
  "password": "Dummy.12345"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### GET /auth/me
Mendapatkan profil user yang sedang login.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Get me successfully",
  "data": {
    "id": "7d25ce36-54af-448c-8a15-f487764c8d83",
    "username": "Mr. Dummy",
    "email": "dummy@gmail.com"
  }
}
```

## 🏷️ Genre Endpoints

### POST /genre
Membuat genre baru. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Dummy Genre"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Genre created successfully",
  "data": {
    "id": "7e7dfc47-f841-4294-ab9f-297696eb126a",
    "name": "Dummy Genre",
    "created_at": "2025-09-05T23:16:33.861Z"
  }
}
```

### GET /genre
Mendapatkan daftar genre dengan pagination dan filtering.

**Query Parameters:**
- `page` (optional): Halaman (default: 1)
- `limit` (optional): Jumlah item per halaman (default: 10)
- `search` (optional): Pencarian berdasarkan nama genre
- `orderByName` (optional): Sorting berdasarkan nama (asc/desc)

**Example:**
```
GET /genre?page=1&limit=10&search=dummy&orderByName=asc
```

**Response (200):**
```json
{
  "success": true,
  "message": "Get all genre successfully",
  "data": [
    {
      "id": "766d3966-d294-4c09-89fe-fbf70320d4f1",
      "name": "Dummy Genre 1"
    },
    {
      "id": "46d0eafa-8f94-4214-84bf-362fe5bb081f",
      "name": "Dummy Genre 2"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "prev_page": null,
    "next_page": 2
  }
}
```

### GET /genre/:genre_id
Mendapatkan detail genre berdasarkan ID.

**Response (200):**
```json
{
  "success": true,
  "message": "Get genre detail successfully",
  "data": {
    "id": "38af5ceb-755f-4ff6-9f08-856fbdd46406",
    "name": "Dummy Genre 10"
  }
}
```

### PATCH /genre/:genre_id
Mengupdate genre. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Dummy Genre 10 Kocak"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Genre updated successfully",
  "data": {
    "id": "38af5ceb-755f-4ff6-9f08-856fbdd46406",
    "name": "Dummy Genre 10 Kocak",
    "updated_at": "2024-10-17T20:43:48.267Z"
  }
}
```

### DELETE /genre/:genre_id
Menghapus genre (soft delete). **Requires Authentication**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Genre removed successfully"
}
```

## 📖 Book Endpoints

### POST /books
Membuat buku baru. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Dummy Book",
  "writer": "Dummy Writer",
  "publisher": "Dummy Publisher",
  "description": "Dummy Description", // Optional
  "publication_year": 2025,
  "price": 50000,
  "stock_quantity": 50,
  "genre_id": "c34b1576-9613-4461-84e1-cbeea61df1db"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Book added successfully",
  "data": {
    "id": "89161fbb-1ca5-48d6-a20d-933cc0d3e96f",
    "title": "Dummy Book",
    "created_at": "2024-12-15T23:20:14.791Z"
  }
}
```

### GET /books
Mendapatkan daftar buku dengan pagination dan filtering.

**Query Parameters:**
- `page` (optional): Halaman (default: 1)
- `limit` (optional): Jumlah item per halaman (default: 10)
- `search` (optional): Pencarian berdasarkan title, writer, atau publisher
- `orderByTitle` (optional): Sorting berdasarkan title (asc/desc)
- `orderByPublishDate` (optional): Sorting berdasarkan publication_year (asc/desc)
- `condition` (optional): Filter berdasarkan kondisi (NEW, LIKE_NEW, VERY_GOOD, GOOD, ACCEPTABLE, POOR)

**Example:**
```
GET /books?page=1&limit=5&search=dummy&orderByTitle=desc&orderByPublishDate=asc&condition=NEW
```

**Response (200):**
```json
{
  "success": true,
  "message": "Get all book successfully",
  "data": [
    {
      "id": "8dfb55aa-18e4-470a-8416-9b405db879b8",
      "title": "Dummy Book 1",
      "writer": "Dummy Writer 1",
      "publisher": "Dummy Publisher 1",
      "description": "Dummy Description 1",
      "publication_year": 2025,
      "price": 50000,
      "stock_quantity": 50,
      "genre": "Dummy Genre 5"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 5,
    "prev_page": null,
    "next_page": 2
  }
}
```

### GET /books/:book_id
Mendapatkan detail buku berdasarkan ID.

**Response (200):**
```json
{
  "success": true,
  "message": "Get book detail successfully",
  "data": {
    "id": "923bf4d7-7c64-490e-b5ee-f752087fc492",
    "title": "Dummy Book 5",
    "writer": "Dummy Writer 5",
    "publisher": "Dummy Publisher 5",
    "description": "Dummy Description 5",
    "publication_year": 2025,
    "price": 50000,
    "stock_quantity": 50,
    "genre": "Dummy Genre 2"
  }
}
```

### GET /books/genre/:genre_id
Mendapatkan daftar buku berdasarkan genre.

**Query Parameters:**
- `page` (optional): Halaman (default: 1)
- `limit` (optional): Jumlah item per halaman (default: 10)
- `search` (optional): Pencarian
- `orderByTitle` (optional): Sorting berdasarkan title (asc/desc)
- `orderByPublishDate` (optional): Sorting berdasarkan publication_year (asc/desc)
- `condition` (optional): Filter berdasarkan kondisi

**Response (200):**
```json
{
  "success": true,
  "message": "Get all book by genre successfully",
  "data": [
    {
      "id": "2253d5bb-4c4c-4cf7-a2b9-4a5888e5f4d5",
      "title": "Dummy Book 13",
      "writer": "Dummy Writer 13",
      "publisher": "Dummy Publisher 13",
      "description": "Dummy Description 13",
      "genre": "Dummy Genre 2",
      "publication_year": 2025,
      "price": 50000,
      "stock_quantity": 50
    }
  ],
  "meta": {
    "page": 1,
    "limit": 5,
    "prev_page": null,
    "next_page": 2
  }
}
```

### PATCH /books/:book_id
Mengupdate buku. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "description": "Dummy Description",
  "price": 50000
  // "stock_quantity": 50, // Optional
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Book updated successfully",
  "data": {
    "id": "6664cfda-aa6e-4a3d-8244-ef42e779f179",
    "title": "Dummy Book",
    "updated_at": "2024-10-17T20:43:48.267Z"
  }
}
```

### DELETE /books/:book_id
Menghapus buku (soft delete). **Requires Authentication**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Book removed successfully"
}
```

## 🛒 Transaction Endpoints

### POST /transactions
Membuat transaksi baru. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "user_id": "7d25ce36-54af-448c-8a15-f487764c8d83",
  "items": [
    {
      "book_id": "2253d5bb-4c4c-4cf7-a2b9-4a5888e5f4d5",
      "quantity": 10
    },
    {
      "book_id": "8dfb55aa-18e4-470a-8416-9b405db879b8",
      "quantity": 3
    },
    {
      "book_id": "1a1399c1-5c76-4ce3-b3d9-b824a47a3832",
      "quantity": 5
    },
    {
      "book_id": "923bf4d7-7c64-490e-b5ee-f752087fc492",
      "quantity": 7
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction_id": "c3353007-bbb7-47d0-83f7-7665ca7c8699",
    "total_quantity": 25,
    "total_price": 999000
  }
}
```

### GET /transactions
Mendapatkan daftar transaksi user. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional): Halaman (default: 1)
- `limit` (optional): Jumlah item per halaman (default: 10)
- `search` (optional): Pencarian berdasarkan ID transaksi
- `orderById` (optional): Sorting berdasarkan ID (asc/desc)
- `orderByAmount` (optional): Sorting berdasarkan total amount (asc/desc)

**Response (200):**
```json
{
  "success": true,
  "message": "Get all transaction successfully",
  "data": [
    {
      "id": "e4f8d1c9-5a0b-4e72-a3f7-9c8b6d2a4e1f",
      "total_quantity": 15,
      "total_price": 45000
    },
    {
      "id": "0c9d8e7b-6a5f-4d32-8b1a-2c3d4e5f6a7b",
      "total_quantity": 20,
      "total_price": 50000
    }
  ]
}
```

### GET /transactions/:transaction_id
Mendapatkan detail transaksi. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Get transaction detail successfully",
  "data": {
    "id": "e4f8d1c9-5a0b-4e72-a3f7-9c8b6d2a4e1f",
    "items": [
      {
        "book_id": "b3e0a5f6-7d1c-4b88-9e52-1f4a3c6d9b0e",
        "book_title": "Dummy Book 7",
        "quantity": 5,
        "subtotal_price": 15000
      },
      {
        "book_id": "a1c2b3d4-e5f6-4789-8012-34567890abcd",
        "book_title": "Dummy Book 2",
        "quantity": 5,
        "subtotal_price": 15000
      }
    ],
    "total_quantity": 15,
    "total_price": 45000
  }
}
```

### GET /transactions/statistics
Mendapatkan statistik transaksi. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Get transactions statistics successfully",
  "data": {
    "total_transactions": 1000,
    "average_transaction_amount": 50000,
    "fewest_book_sales_genre": "Science Fiction",
    "most_book_sales_genre": "Fantasy"
  }
}
```

## 🏥 Health Check

### GET /health-check
Mengecek status API.

**Response (200):**
```json
{
  "success": true,
  "message": "Hello World!",
  "date": "Wed Oct 22 2025"
}
```

## 🧪 Testing

### Postman Collection
Import file `Dokumentasi API Praktikum Pemrograman Web Modul 3.postman_collection.json` ke Postman untuk testing lengkap.

### Environment Variables untuk Postman
```json
{
  "BASE_URL": "http://localhost:8080",
  "BEARER_TOKEN": ""
}
```

### Testing Workflow
1. **Health Check** → **Register** → **Login** → **Set BEARER_TOKEN**
2. **Create Genre** → **Create Book** → **Create Transaction**
3. **Test all endpoints** dengan token yang valid

## 📊 Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Access token required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start development server dengan nodemon

# Build
npm run build        # Compile TypeScript ke JavaScript
npm start           # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push     # Push schema ke database
npm run db:migrate  # Run database migrations

# Testing
npm test            # Run tests (API testing via Postman)
```

## 📁 Project Structure

```
src/
├── index.ts              # Main application entry point
├── lib/
│   └── prisma.ts         # Prisma client configuration
├── middleware/
│   ├── auth.ts           # JWT authentication middleware
│   └── validation.ts     # Input validation middleware
└── routes/
    ├── index.ts          # Route exports
    ├── auth.ts           # Authentication routes
    ├── books.ts          # Book management routes
    ├── genres.ts         # Genre management routes
    └── transactions.ts   # Transaction routes
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs untuk password security
- **Input Validation**: Comprehensive validation untuk semua input
- **SQL Injection Protection**: Prisma ORM mencegah SQL injection
- **CORS**: Cross-origin resource sharing configuration
- **Error Handling**: Secure error messages tanpa data exposure

## 🚀 Deployment

### Environment Variables untuk Production
```env
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=8080
NODE_ENV=production
```

### Build untuk Production
```bash
npm run build
npm start
```

## 📝 API Response Format

Semua API response mengikuti format konsisten:

```json
{
  "success": true|false,        // Boolean status
  "message": "string",          // Human readable message
  "data": {}|[]|undefined       // Response data (object, array, or undefined)
}
```

### Pagination Metadata
Untuk endpoint dengan pagination, response termasuk metadata:

```json
{
  "success": true,
  "message": "Success message",
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "prev_page": null,
    "next_page": 2
  }
}
```

## 🎯 Features Summary

- ✅ **Complete CRUD Operations** untuk semua entities
- ✅ **JWT Authentication** dengan token expiration
- ✅ **Soft Delete** untuk data integrity
- ✅ **Pagination & Filtering** untuk performa optimal
- ✅ **Search Functionality** di multiple fields
- ✅ **Transaction Management** dengan stock validation
- ✅ **Statistics & Analytics** untuk insights
- ✅ **Comprehensive Validation** untuk data integrity
- ✅ **Error Handling** yang konsisten
- ✅ **TypeScript** untuk type safety
- ✅ **Prisma ORM** untuk database operations
- ✅ **PostgreSQL** dengan Neon Database

## 📞 Support

Untuk pertanyaan atau bantuan, silakan buat issue di repository atau hubungi developer.

---

**Dibuat dengan ❤️ untuk Praktikum Pemrograman Web Modul 3**