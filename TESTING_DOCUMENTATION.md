# 🧪 IT Literature Shop API - Testing Documentation

Dokumentasi lengkap untuk testing API IT Literature Shop yang terdiri dari beberapa modul.

## 🧩 Autentikasi (Auth)

### 1. Register dengan Email Baru
Lakukan POST `/auth/register` dengan data user baru yang valid.

**Request:**
```json
POST /auth/register
{
  "username": "Mr. Dummy",
  "email": "dummy@gmail.com",
  "password": "Dummy.12345"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "...",
    "email": "dummy@gmail.com",
    "created_at": "..."
  }
}
```

📸 Screenshot: `public/auth/1_register(success).png`

---

### 2. Register dengan Email yang Sama
Lakukan POST `/auth/register` lagi dengan body request yang sama persis.

**Request:**
```json
POST /auth/register
{
  "username": "Mr. Dummy",
  "email": "dummy@gmail.com",
  "password": "Dummy.12345"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

📸 Screenshot: `public/auth/2_register_(sameAccount).png`

---

### 3. Login Berhasil
Lakukan POST `/auth/login` menggunakan email dan password yang berhasil didaftarkan.

**Request:**
```json
POST /auth/login
{
  "email": "dummy@gmail.com",
  "password": "Dummy.12345"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

📸 Screenshot: `public/auth/3_login.png`

---

### 4. Login dengan Password Salah
Lakukan POST `/auth/login` lagi, tapi dengan password yang salah.

**Request:**
```json
POST /auth/login
{
  "email": "dummy@gmail.com",
  "password": "WrongPassword"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

📸 Screenshot: `public/auth/4_login(incorrectPassword).png`

---

### 5. Get Me (Mendapatkan Profil User)
Lakukan GET `/auth/me` dengan Bearer Token yang sudah di-set.

**Request:**
```
GET /auth/me
Headers:
  Authorization: Bearer <access_token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Get me successfully",
  "data": {
    "id": "...",
    "username": "Mr. Dummy",
    "email": "dummy@gmail.com"
  }
}
```

📸 Screenshot: `public/auth/5_getMe(validToken).png`

---

### 6. Get Me dengan Token Tidak Valid
Ganti Bearer Token dengan teks random (contoh: "kucing"), lalu lakukan GET `/auth/me`.

**Request:**
```
GET /auth/me
Headers:
  Authorization: Bearer kucing
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

📸 Screenshot: `public/auth/6_getMe(invalidToken).png`

---

## 🏷️ Genre

### 1. Create New Genre
Buat 2 genre baru (misal: "Fiction", "History") melalui POST `/genre`.

**Request:**
```json
POST /genre
{
  "name": "Fiction"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Genre created successfully",
  "data": {
    "id": "...",
    "name": "Fiction",
    "created_at": "..."
  }
}
```

📸 Screenshot: 
- `public/genre/1_newGenre(fiction).png`
- `public/genre/1_newGenre(history).png`

---

### 2. Create Genre dengan Nama yang Sama
Coba buat lagi genre dengan nama "Fiction".

**Request:**
```json
POST /genre
{
  "name": "Fiction"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Genre with this name already exists"
}
```

📸 Screenshot: `public/genre/2_newGenre(alreadyExist).png`

---

### 3. Delete Genre (Soft Delete)
Hapus salah satu genre yang telah dibuat melalui DELETE `/genre/:id`.

**Request:**
```
DELETE /genre/:id
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Genre removed successfully"
}
```

📸 Screenshot: `public/genre/3_deleteGenre(fiction).png`

---

## 📖 Buku (Library)

### 1. Add New Book dengan Validasi Gagal

#### a. Hit POST /books dengan price bernilai negatif
**Request:**
```json
POST /books
{
  "title": "Test Book",
  "writer": "Test Writer",
  "publisher": "Test Publisher",
  "publication_year": 2024,
  "price": -100,
  "stock_quantity": 50,
  "genre_id": "..."
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Price must be greater than 0"
}
```

📸 Screenshot: `public/book/1_postBooks(negativePrice).png`

#### b. Hit POST /books dengan publication_year lebih dari 2025
**Request:**
```json
POST /books
{
  "title": "Test Book",
  "writer": "Test Writer",
  "publisher": "Test Publisher",
  "publication_year": 2026,
  "price": 10000,
  "stock_quantity": 50,
  "genre_id": "..."
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid publication year"
}
```

📸 Screenshot: `public/book/1_postBooks(over2025).png`

---

### 2. Add New Book Berhasil
Tambahkan 3 buku baru dengan data yang valid (gunakan genre yang sudah dibuat).

**Request:**
```json
POST /books
{
  "title": "Book 1",
  "writer": "Writer 1",
  "publisher": "Publisher 1",
  "publication_year": 2024,
  "price": 50000,
  "stock_quantity": 100,
  "genre_id": "..."
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Book added successfully",
  "data": {
    "id": "...",
    "title": "Book 1",
    "created_at": "..."
  }
}
```

📸 Screenshot: 
- `public/book/2_addBooks_1.png`
- `public/book/2_addBooks_2.png`
- `public/book/2_addBooks_3.png`

---

### 3. Get All Books dengan Sorting

#### a. Hit GET /books?orderByTitle=asc
**Request:**
```
GET /books?orderByTitle=asc
```

**Expected Response:** Books sorted by title ascending

📸 Screenshot: `public/book/3_sortBooks(asc).png`

#### b. Hit GET /books?orderByTitle=desc
**Request:**
```
GET /books?orderByTitle=desc
```

**Expected Response:** Books sorted by title descending

📸 Screenshot: `public/book/3_sortBooks(desc).png`

---

### 4. Delete Book (Soft Delete)
Hapus salah satu buku melalui DELETE `/books/:id`.

**Request:**
```
DELETE /books/:id
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Book removed successfully"
}
```

📸 Screenshot: `public/book/4_deleteBooks(success).png`

---

### 5. Delete Book yang Sama Lagi
Lakukan DELETE `/books/:id` lagi dengan ID yang sama persis.

**Request:**
```
DELETE /books/:id
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Book not found"
}
```

📸 Screenshot: `public/book/5_deleteBooks(sameId).png`

---

## 💳 Transaksi (Transactions)

### 1. Create Transaction Gagal (Stok Tidak Cukup & Atomicity)
Buat transaksi (POST `/transactions`) dengan 3 item buku.
Atur agar stok buku pertama dan kedua cukup, tetapi quantity buku ketiga melebihi stoknya.

**Request:**
```json
POST /transactions
{
  "user_id": "...",
  "items": [
    {
      "book_id": "book_id_1",
      "quantity": 10
    },
    {
      "book_id": "book_id_2",
      "quantity": 5
    },
    {
      "book_id": "book_id_3",
      "quantity": 100  // Melebihi stok
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Insufficient stock for book: Book 3. Available: 5, Requested: 100"
}
```

📸 Screenshot: `public/transaction/1_createTransaction(not-enouch-stock_ atomicity).png`

---

### 2. Create Transaction Berhasil
Buat transaksi baru dengan quantity yang valid untuk minimal 3 buku.

**Request:**
```json
POST /transactions
{
  "user_id": "...",
  "items": [
    {
      "book_id": "book_id_1",
      "quantity": 10
    },
    {
      "book_id": "book_id_2",
      "quantity": 5
    },
    {
      "book_id": "book_id_3",
      "quantity": 3
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction_id": "...",
    "total_quantity": 18,
    "total_price": 950000
  }
}
```

📸 Screenshot: `public/transaction/2_createTransaction(success).png`

---

### 3. Get Transaction Statistics
Lakukan GET `/transactions/statistics`.

**Request:**
```
GET /transactions/statistics
Headers:
  Authorization: Bearer <access_token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Get transactions statistics successfully",
  "data": {
    "total_transactions": 1,
    "average_transaction_amount": 950000,
    "fewest_book_sales_genre": "History",
    "most_book_sales_genre": "Fiction"
  }
}
```

📸 Screenshot: `public/transaction/3_transactionStatistics(most&fewest).png`

---

## ❤️ Health Check

### 1. Health Check Endpoint
Lakukan GET `/health-check`.

**Request:**
```
GET /health-check
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Hello World!",
  "date": "Wed Oct 22 2025"
}
```

📸 Screenshot: `public/health-check/1_health-check.png`

---

## 📝 Testing Checklist

### ✅ Authentication Module
- [ ] Register dengan email baru
- [ ] Register dengan email yang sama (error)
- [ ] Login berhasil
- [ ] Login dengan password salah
- [ ] Get me dengan token valid
- [ ] Get me dengan token tidak valid

### ✅ Genre Module
- [ ] Create new genre
- [ ] Create genre dengan nama yang sama (error)
- [ ] Delete genre (soft delete)

### ✅ Book Module
- [ ] Add book dengan validasi gagal (negative price)
- [ ] Add book dengan validasi gagal (publication year > 2025)
- [ ] Add book berhasil (3 buku)
- [ ] Get all books dengan sorting ascending
- [ ] Get all books dengan sorting descending
- [ ] Delete book (soft delete)
- [ ] Delete book yang sama lagi (error)

### ✅ Transaction Module
- [ ] Create transaction gagal (stock tidak cukup)
- [ ] Create transaction berhasil
- [ ] Get transaction statistics

### ✅ Health Check
- [ ] Health check endpoint

---

## 🎯 Testing Scenario Summary

1. **Authentication Flow**: Register → Login → Get Profile
2. **Error Handling**: Invalid credentials, duplicate data, validation errors
3. **CRUD Operations**: Create, Read, Update, Delete untuk semua modules
4. **Validation**: Input validation dan error messages
5. **Atomicity**: Transaction rollback saat stock tidak cukup
6. **Sorting**: ASC dan DESC sorting untuk books
7. **Statistics**: Transaction statistics dengan fewest dan most book sales genre

---

**Total Test Cases**: 19 test cases
**Status**: ✅ All endpoints tested and working correctly
