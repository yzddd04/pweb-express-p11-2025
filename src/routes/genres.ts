import express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { validateGenre } from '../middleware/validation';

const router = express.Router();

// POST /genre - Create Genre
router.post('/', authenticateToken, validateGenre, async (req, res) => {
  try {
    const { name } = req.body;

    // Check if genre already exists
    const existingGenre = await prisma.genres.findUnique({
      where: { name }
    });

    if (existingGenre) {
      return res.status(400).json({
        success: false,
        message: 'Genre with this name already exists'
      });
    }

    // Create genre
    const genre = await prisma.genres.create({
      data: { name }
    });

    res.status(201).json({
      success: true,
      message: 'Genre created successfully',
      data: {
        id: genre.id,
        name: genre.name,
        created_at: genre.created_at
      }
    });
  } catch (error) {
    console.error('Create genre error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create genre'
    });
  }
});

// GET /genre - Get All Genres
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sort_by = req.query.sort_by as string || 'created_at';
    const sort_order = req.query.sort_order as string || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deleted_at: null // Only show non-deleted genres
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    // Build order by clause
    const orderBy: any = {};
    orderBy[sort_by] = sort_order;

    // Get genres with pagination
    const [genres, total] = await Promise.all([
      prisma.genres.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              books: {
                where: {
                  deleted_at: null
                }
              }
            }
          }
        }
      }),
      prisma.genres.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: 'Get all genre successfully',
      data: genres.map(genre => ({
        id: genre.id,
        name: genre.name
      })),
      meta: {
        page,
        limit,
        prev_page: page > 1 ? page - 1 : null,
        next_page: page < totalPages ? page + 1 : null
      }
    });
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get genres'
    });
  }
});

// GET /genre/:genre_id - Get Genre Detail
router.get('/:genre_id', async (req, res) => {
  try {
    const { genre_id } = req.params;

    const genre = await prisma.genres.findUnique({
      where: { 
        id: genre_id,
        deleted_at: null
      },
      include: {
        _count: {
          select: {
            books: {
              where: {
                deleted_at: null
              }
            }
          }
        }
      }
    });

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Genre not found'
      });
    }

    res.json({
      success: true,
      message: 'Get genre detail successfully',
      data: {
        id: genre.id,
        name: genre.name
      }
    });
  } catch (error) {
    console.error('Get genre detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get genre detail'
    });
  }
});

// PATCH /genre/:genre_id - Update Genre
router.patch('/:genre_id', authenticateToken, async (req, res) => {
  try {
    const { genre_id } = req.params;
    const { name } = req.body;

    // Check if genre exists
    const existingGenre = await prisma.genres.findUnique({
      where: { 
        id: genre_id,
        deleted_at: null
      }
    });

    if (!existingGenre) {
      return res.status(404).json({
        success: false,
        message: 'Genre not found'
      });
    }

    // If updating name, check for duplicates
    if (name && name !== existingGenre.name) {
      const duplicateGenre = await prisma.genres.findUnique({
        where: { name }
      });

      if (duplicateGenre) {
        return res.status(400).json({
          success: false,
          message: 'Genre with this name already exists'
        });
      }
    }

    // Update genre
    const genre = await prisma.genres.update({
      where: { id: genre_id },
      data: { name },
      include: {
        _count: {
          select: {
            books: {
              where: {
                deleted_at: null
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Genre updated successfully',
      data: {
        id: genre.id,
        name: genre.name,
        updated_at: genre.updated_at
      }
    });
  } catch (error) {
    console.error('Update genre error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update genre'
    });
  }
});

// DELETE /genre/:genre_id - Delete Genre (Soft Delete)
router.delete('/:genre_id', authenticateToken, async (req, res) => {
  try {
    const { genre_id } = req.params;

    // Check if genre exists
    const existingGenre = await prisma.genres.findUnique({
      where: { 
        id: genre_id,
        deleted_at: null
      },
      include: {
        _count: {
          select: {
            books: {
              where: {
                deleted_at: null
              }
            }
          }
        }
      }
    });

    if (!existingGenre) {
      return res.status(404).json({
        success: false,
        message: 'Genre not found'
      });
    }

    // Check if genre has books
    if (existingGenre._count.books > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete genre that has books. Please delete or move the books first.'
      });
    }

    // Soft delete genre
    await prisma.genres.update({
      where: { id: genre_id },
      data: { deleted_at: new Date() }
    });

    res.json({
      success: true,
      message: 'Genre removed successfully'
    });
  } catch (error) {
    console.error('Delete genre error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete genre'
    });
  }
});

export default router;
