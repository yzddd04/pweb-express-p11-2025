import express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { validateBook } from '../middleware/validation';

const router = express.Router();

// POST /books - Create Book
router.post('/', authenticateToken, validateBook, async (req, res) => {
  try {
    const { title, writer, publisher, publication_year, description, price, stock_quantity, genre_id } = req.body;

    // Check if genre exists
    const genre = await prisma.genres.findUnique({
      where: { id: genre_id }
    });

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Genre not found'
      });
    }

    // Check if book title already exists
    const existingBook = await prisma.books.findUnique({
      where: { title }
    });

    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: 'Book with this title already exists'
      });
    }

    // Create book
    const book = await prisma.books.create({
      data: {
        title,
        writer,
        publisher,
        publication_year,
        description,
        price,
        stock_quantity,
        genre_id
      },
      include: {
        genre: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: { book }
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create book'
    });
  }
});

// GET /books - Get All Books with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const genre_id = req.query.genre_id as string;
    const min_price = parseFloat(req.query.min_price as string);
    const max_price = parseFloat(req.query.max_price as string);
    const sort_by = req.query.sort_by as string || 'created_at';
    const sort_order = req.query.sort_order as string || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deleted_at: null // Only show non-deleted books
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { writer: { contains: search, mode: 'insensitive' } },
        { publisher: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (genre_id) {
      where.genre_id = genre_id;
    }

    if (!isNaN(min_price)) {
      where.price = { ...where.price, gte: min_price };
    }

    if (!isNaN(max_price)) {
      where.price = { ...where.price, lte: max_price };
    }

    // Build order by clause
    const orderBy: any = {};
    orderBy[sort_by] = sort_order;

    // Get books with pagination
    const [books, total] = await Promise.all([
      prisma.books.findMany({
        where,
        include: {
          genre: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.books.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: 'Books retrieved successfully',
      data: {
        books,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get books'
    });
  }
});

// GET /books/:book_id - Get Book Detail
router.get('/:book_id', async (req, res) => {
  try {
    const { book_id } = req.params;

    const book = await prisma.books.findUnique({
      where: { 
        id: book_id,
        deleted_at: null
      },
      include: {
        genre: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      message: 'Book detail retrieved successfully',
      data: { book }
    });
  } catch (error) {
    console.error('Get book detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get book detail'
    });
  }
});

// GET /books/genre/:genre_id - Get Books by Genre
router.get('/genre/:genre_id', async (req, res) => {
  try {
    const { genre_id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sort_by = req.query.sort_by as string || 'created_at';
    const sort_order = req.query.sort_order as string || 'desc';

    const skip = (page - 1) * limit;

    // Check if genre exists
    const genre = await prisma.genres.findUnique({
      where: { id: genre_id }
    });

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Genre not found'
      });
    }

    // Build where clause
    const where: any = {
      genre_id,
      deleted_at: null
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { writer: { contains: search, mode: 'insensitive' } },
        { publisher: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build order by clause
    const orderBy: any = {};
    orderBy[sort_by] = sort_order;

    // Get books with pagination
    const [books, total] = await Promise.all([
      prisma.books.findMany({
        where,
        include: {
          genre: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.books.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: 'Books by genre retrieved successfully',
      data: {
        genre: {
          id: genre.id,
          name: genre.name
        },
        books,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get books by genre error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get books by genre'
    });
  }
});

// PATCH /books/:book_id - Update Book
router.patch('/:book_id', authenticateToken, async (req, res) => {
  try {
    const { book_id } = req.params;
    const updateData = req.body;

    // Check if book exists
    const existingBook = await prisma.books.findUnique({
      where: { 
        id: book_id,
        deleted_at: null
      }
    });

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // If updating title, check for duplicates
    if (updateData.title && updateData.title !== existingBook.title) {
      const duplicateBook = await prisma.books.findUnique({
        where: { title: updateData.title }
      });

      if (duplicateBook) {
        return res.status(400).json({
          success: false,
          message: 'Book with this title already exists'
        });
      }
    }

    // If updating genre_id, check if genre exists
    if (updateData.genre_id) {
      const genre = await prisma.genres.findUnique({
        where: { id: updateData.genre_id }
      });

      if (!genre) {
        return res.status(404).json({
          success: false,
          message: 'Genre not found'
        });
      }
    }

    // Update book
    const book = await prisma.books.update({
      where: { id: book_id },
      data: updateData,
      include: {
        genre: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: { book }
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update book'
    });
  }
});

// DELETE /books/:book_id - Delete Book (Soft Delete)
router.delete('/:book_id', authenticateToken, async (req, res) => {
  try {
    const { book_id } = req.params;

    // Check if book exists
    const existingBook = await prisma.books.findUnique({
      where: { 
        id: book_id,
        deleted_at: null
      }
    });

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Soft delete book
    await prisma.books.update({
      where: { id: book_id },
      data: { deleted_at: new Date() }
    });

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete book'
    });
  }
});

export default router;
