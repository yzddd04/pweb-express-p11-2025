# IT Literature Shop Backend API

Backend API untuk IT Literature Shop dengan fitur lengkap untuk manajemen buku, genre, dan transaksi.

## 🚀 Fitur

### Authentication
- ✅ **POST** `/auth/register` - Registrasi pengguna baru
- ✅ **POST** `/auth/login` - Login dengan JWT token
- ✅ **GET** `/auth/me` - Mendapatkan profil pengguna

### Library (Books)
- ✅ **POST** `/books` - Membuat buku baru (dengan validasi duplikasi judul)
- ✅ **GET** `/books` - Daftar buku dengan pagination & filtering
- ✅ **GET** `/books/:book_id` - Detail buku
- ✅ **GET** `/books/genre/:genre_id` - Buku berdasarkan genre dengan pagination
- ✅ **PATCH** `/books/:book_id` - Update buku (termasuk stok)
- ✅ **DELETE** `/books/:book_id` - Hapus buku (soft delete)

### Genre
- ✅ **POST** `/genre` - Membuat genre baru
- ✅ **GET** `/genre` - Daftar genre dengan pagination
- ✅ **GET** `/genre/:genre_id` - Detail genre
- ✅ **PATCH** `/genre/:genre_id` - Update genre
- ✅ **DELETE** `/genre/:genre_id` - Hapus genre (soft delete)

### Transaction
- ✅ **POST** `/transactions` - Membuat transaksi pembelian
- ✅ **GET** `/transactions` - Daftar transaksi pengguna
- ✅ **GET** `/transactions/:transaction_id` - Detail transaksi
- ✅ **GET** `/transactions/statistics` - Statistik penjualan lengkap

## 🛠️ Teknologi

- **Node.js** dengan **TypeScript**
- **Express.js** untuk web framework
- **Prisma** untuk database ORM
- **PostgreSQL** (Neon Database)
- **JWT** untuk authentication
- **bcryptjs** untuk password hashing

## 📦 Instalasi

1. **Clone repository**
```bash
git clone <repository-url>
cd it-literature-shop-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
# File .env sudah tersedia dengan konfigurasi Neon Database
DATABASE_URL="postgresql://neondb_owner:npg_MvI1zdSNRLt6@ep-holy-bird-ad13vbq0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=8080
```

4. **Generate Prisma client**
```bash
npm run db:generate
```

5. **Push database schema**
```bash
npm run db:push
```

6. **Start development server**
```bash
npm run dev
```

## 🔧 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "username" // optional
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get User Profile
```http
GET /auth/me
Authorization: Bearer <jwt_token>
```

### Book Endpoints

#### Create Book
```http
POST /books
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Book Title",
  "writer": "Author Name",
  "publisher": "Publisher Name",
  "publication_year": 2023,
  "description": "Book description",
  "price": 100000,
  "stock_quantity": 10,
  "genre_id": "genre-uuid"
}
```

#### Get All Books
```http
GET /books?page=1&limit=10&search=keyword&genre_id=uuid&min_price=50000&max_price=200000&sort_by=price&sort_order=asc
```

#### Get Book Detail
```http
GET /books/:book_id
```

#### Get Books by Genre
```http
GET /books/genre/:genre_id?page=1&limit=10&search=keyword
```

#### Update Book
```http
PATCH /books/:book_id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "stock_quantity": 15
}
```

#### Delete Book
```http
DELETE /books/:book_id
Authorization: Bearer <jwt_token>
```

### Genre Endpoints

#### Create Genre
```http
POST /genre
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Fiction"
}
```

#### Get All Genres
```http
GET /genre?page=1&limit=10&search=keyword
```

#### Get Genre Detail
```http
GET /genre/:genre_id
```

#### Update Genre
```http
PATCH /genre/:genre_id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Genre Name"
}
```

#### Delete Genre
```http
DELETE /genre/:genre_id
Authorization: Bearer <jwt_token>
```

### Transaction Endpoints

#### Create Transaction
```http
POST /transactions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "items": [
    {
      "book_id": "book-uuid-1",
      "quantity": 2
    },
    {
      "book_id": "book-uuid-2",
      "quantity": 1
    }
  ]
}
```

#### Get All Transactions
```http
GET /transactions?page=1&limit=10&sort_by=created_at&sort_order=desc
Authorization: Bearer <jwt_token>
```

#### Get Transaction Detail
```http
GET /transactions/:transaction_id
Authorization: Bearer <jwt_token>
```

#### Get Transaction Statistics
```http
GET /transactions/statistics
Authorization: Bearer <jwt_token>
```

## 🔒 Security Features

- **JWT Authentication** untuk semua endpoint yang memerlukan autentikasi
- **Password Hashing** dengan bcryptjs
- **Input Validation** untuk semua endpoint
- **Soft Delete** untuk buku dan genre (data transaksi tetap aman)
- **Stock Validation** untuk transaksi

## 📊 Database Schema

Project menggunakan Prisma ORM dengan schema yang sudah terintegrasi dengan Neon Database:

- **users** - Data pengguna
- **books** - Data buku dengan relasi ke genre
- **genres** - Data genre buku
- **orders** - Data transaksi
- **order_items** - Detail item dalam transaksi

## 🚀 Deployment

Server akan berjalan di port 8080 (atau sesuai environment variable PORT).

Health check endpoint: `GET /health`

## 📝 Response Format

Semua response menggunakan format konsisten:

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

Error response:
```json
{
  "success": false,
  "message": "Error message"
}
```

## 🎯 Fitur Khusus

1. **Pagination & Filtering** - Semua endpoint list mendukung pagination dan filtering
2. **Search Functionality** - Pencarian berdasarkan judul, penulis, dan publisher
3. **Stock Management** - Otomatis update stok saat transaksi
4. **Transaction Statistics** - Analisis penjualan lengkap
5. **Soft Delete** - Data tidak benar-benar dihapus untuk menjaga integritas
6. **Input Validation** - Validasi input yang komprehensif
7. **Error Handling** - Error handling yang konsisten

## 🔧 Development

Project sudah siap untuk development dengan:
- TypeScript configuration
- Hot reload dengan nodemon
- Prisma database management
- CORS enabled
- Comprehensive error handling
