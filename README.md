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

### Postman Collection
Import file `Dokumentasi API Praktikum Pemrograman Web Modul 3.postman_collection.json` ke Postman untuk testing lengkap.

## 📝 Endpoints Summary

### Authentication (`/auth`)
- `POST /auth/register` - Register user baru
- `POST /auth/login` - Login user dan mendapatkan JWT token
- `GET /auth/me` - Mendapatkan profil user yang sedang login

### Genre (`/genre`)
- `POST /genre` - Membuat genre baru (Requires Auth)
- `GET /genre` - Mendapatkan daftar genre dengan pagination
- `GET /genre/:id` - Mendapatkan detail genre
- `PATCH /genre/:id` - Mengupdate genre (Requires Auth)
- `DELETE /genre/:id` - Menghapus genre soft delete (Requires Auth)

### Books (`/books`)
- `POST /books` - Membuat buku baru (Requires Auth)
- `GET /books` - Mendapatkan daftar buku dengan filtering & sorting
- `GET /books/:id` - Mendapatkan detail buku
- `GET /books/genre/:genre_id` - Mendapatkan buku berdasarkan genre
- `PATCH /books/:id` - Mengupdate buku (Requires Auth)
- `DELETE /books/:id` - Menghapus buku soft delete (Requires Auth)

### Transactions (`/transactions`)
- `POST /transactions` - Membuat transaksi baru (Requires Auth)
- `GET /transactions` - Mendapatkan daftar transaksi user
- `GET /transactions/:id` - Mendapatkan detail transaksi
- `GET /transactions/statistics` - Mendapatkan statistik transaksi (Requires Auth)

### Health Check
- `GET /health-check` - Mengecek status API

> 📚 **Dokumentasi lengkap**: Import Postman collection `Dokumentasi API Praktikum Pemrograman Web Modul 3.postman_collection.json` untuk detail lengkap semua endpoints dengan request/response examples.

## 🧪 Testing

### Testing Documentation
Untuk dokumentasi testing lengkap dengan screenshot, lihat file [TESTING_DOCUMENTATION.md](./TESTING_DOCUMENTATION.md)

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

#### 🧩 Module 1: Authentication
1. **Register** → Create new user with valid email
2. **Register (duplicate)** → Test duplicate email error
3. **Login** → Get access token
4. **Login (error)** → Test with wrong password
5. **Get Me** → Get user profile with valid token
6. **Get Me (error)** → Test with invalid token

#### 🏷️ Module 2: Genre
1. **Create Genre** → Create 2 new genres (Fiction, History)
2. **Create Genre (duplicate)** → Test duplicate name error
3. **Delete Genre** → Soft delete genre

#### 📖 Module 3: Books
1. **Create Book (validation error)** → Test negative price and invalid year
2. **Create Book** → Add 3 books with valid data
3. **Get Books (sorting)** → Test ASC and DESC sorting
4. **Delete Book** → Soft delete book
5. **Delete Book (error)** → Test delete already deleted book

#### 💳 Module 4: Transactions
1. **Create Transaction (error)** → Test insufficient stock with atomicity
2. **Create Transaction** → Create successful transaction with 3 books
3. **Get Statistics** → Get transaction statistics with fewest and most sales genre

#### ❤️ Module 5: Health Check
1. **Health Check** → Test API status

### Test Cases Summary
- **Total Test Cases**: 19 test cases
- **Success Cases**: 14 cases
- **Error Cases**: 5 cases

### Screenshots

#### 🧩 Authentication
![Register Success](public/auth/1_register(success).png)
![Register Duplicate](public/auth/2_register_(sameAccount).png)
![Login Success](public/auth/3_login.png)
![Login Error](public/auth/4_login(incorrectPassword).png)
![Get Me Valid Token](public/auth/5_getMe(validToken).png)
![Get Me Invalid Token](public/auth/6_getMe(invalidToken).png)

#### 🏷️ Genre
![Create Fiction Genre](public/genre/1_newGenre(fiction).png)
![Create History Genre](public/genre/1_newGenre(history).png)
![Create Duplicate Genre](public/genre/2_newGenre(alreadyExist).png)
![Delete Genre](public/genre/3_deleteGenre(fiction).png)

#### 📖 Books
![Book Validation Error - Negative Price](public/book/1_postBooks(negativePrice).png)
![Book Validation Error - Year Over 2025](public/book/1_postBooks(over2025).png)
![Add Books 1](public/book/2_addBooks_1.png)
![Add Books 2](public/book/2_addBooks_2.png)
![Add Books 3](public/book/2_addBooks_3.png)
![Sort Books ASC](public/book/3_sortBooks(asc).png)
![Sort Books DESC](public/book/3_sortBooks(desc).png)
![Delete Book Success](public/book/4_deleteBooks(success).png)
![Delete Book Error](public/book/5_deleteBooks(sameId).png)

#### 💳 Transactions
![Transaction Insufficient Stock](public/transaction/1_createTransaction(not-enouch-stock_ atomicity).png)
![Transaction Success](public/transaction/2_createTransaction(success).png)
![Transaction Statistics](public/transaction/3_transactionStatistics(most&fewest).png)

#### ❤️ Health Check
![Health Check](public/health-check/1_health-check.png)

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