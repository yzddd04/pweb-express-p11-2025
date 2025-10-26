import express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { validateTransaction } from '../middleware/validation';

const router = express.Router();

// POST /transactions - Create Transaction
router.post('/', authenticateToken, validateTransaction, async (req: any, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    // Validate all books exist and have sufficient stock
    const bookIds = items.map((item: { book_id: string; quantity: number }) => item.book_id);
    const books = await prisma.books.findMany({
      where: {
        id: { in: bookIds },
        deleted_at: null
      }
    });

    if (books.length !== bookIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more books not found'
      });
    }

    // Check stock availability
    for (const item of items) {
      const book = books.find((b: any) => b.id === item.book_id);
      if (!book || book.stock_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for book: ${book?.title}. Available: ${book?.stock_quantity}, Requested: ${item.quantity}`
        });
      }
    }

    // Create transaction using Prisma transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create order
      const order = await tx.orders.create({
        data: {
          user_id: userId
        }
      });

      // Create order items and update book stock
      const orderItems = [];
      let totalAmount = 0;

      for (const item of items) {
        const book = books.find((b: any) => b.id === item.book_id)!;
        const itemTotal = book.price * item.quantity;
        totalAmount += itemTotal;

        // Create order item
        const orderItem = await tx.order_items.create({
          data: {
            order_id: order.id,
            book_id: item.book_id,
            quantity: item.quantity
          },
          include: {
            book: {
              select: {
                id: true,
                title: true,
                price: true
              }
            }
          }
        });

        // Update book stock
        await tx.books.update({
          where: { id: item.book_id },
          data: {
            stock_quantity: {
              decrement: item.quantity
            }
          }
        });

        orderItems.push(orderItem);
      }

      return {
        order,
        orderItems,
        totalAmount
      };
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        transaction_id: result.order.id,
        total_quantity: items.reduce((sum: number, item: { book_id: string; quantity: number }) => sum + item.quantity, 0),
        total_price: result.totalAmount
      }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction'
    });
  }
});

// GET /transactions/statistics - Get Transaction Statistics
router.get('/statistics', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;

    // Get all transactions for the user
    const transactions = await prisma.orders.findMany({
      where: { user_id: userId },
      include: {
        order_items: {
          include: {
            book: {
              select: {
                price: true,
                genre_id: true,
                genre: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Calculate statistics
    const totalTransactions = transactions.length;
    let totalAmount = 0;
    const genreStats: { [key: string]: { name: string; count: number; amount: number } } = {};

    transactions.forEach((transaction: any) => {
      transaction.order_items.forEach((item: any) => {
        const itemTotal = item.book.price * item.quantity;
        totalAmount += itemTotal;

        const genreName = item.book.genre.name;
        if (!genreStats[genreName]) {
          genreStats[genreName] = {
            name: genreName,
            count: 0,
            amount: 0
          };
        }
        genreStats[genreName].count += 1;
        genreStats[genreName].amount += itemTotal;
      });
    });

    const averageTransaction = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

    // Find genre with most and least transactions
    const genreArray = Object.values(genreStats);
    const genreWithMostTransactions = genreArray.length > 0 
      ? genreArray.reduce((max, genre) => genre.count > max.count ? genre : max)
      : null;
    const genreWithLeastTransactions = genreArray.length > 0 
      ? genreArray.reduce((min, genre) => genre.count < min.count ? genre : min)
      : null;

    res.json({
      success: true,
      message: 'Get transactions statistics successfully',
      data: {
        total_transactions: totalTransactions,
        average_transaction_amount: Math.round(averageTransaction * 100) / 100,
        fewest_book_sales_genre: genreWithLeastTransactions?.name || 'N/A',
        most_book_sales_genre: genreWithMostTransactions?.name || 'N/A'
      }
    });
  } catch (error) {
    console.error('Get transaction statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction statistics'
    });
  }
});

// GET /transactions - Get All Transactions
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort_by = req.query.sort_by as string || 'created_at';
    const sort_order = req.query.sort_order as string || 'desc';

    const skip = (page - 1) * limit;

    // Build order by clause
    const orderBy: any = {};
    orderBy[sort_by] = sort_order;

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.orders.findMany({
        where: { user_id: userId },
        include: {
          order_items: {
            include: {
              book: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  writer: true
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.orders.count({ where: { user_id: userId } })
    ]);

    // Calculate total amount for each transaction
    const transactionsWithTotal = transactions.map((transaction: any) => {
      const totalAmount = transaction.order_items.reduce((sum: number, item: any) => {
        return sum + (item.book.price * item.quantity);
      }, 0);

      return {
        id: transaction.id,
        user_id: transaction.user_id,
        total_amount: totalAmount,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
        items: transaction.order_items
      };
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: 'Get all transaction successfully',
      data: transactionsWithTotal.map(transaction => ({
        id: transaction.id,
        total_quantity: transaction.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        total_price: transaction.total_amount
      }))
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions'
    });
  }
});

// GET /transactions/:transaction_id - Get Transaction Detail
router.get('/:transaction_id', authenticateToken, async (req: any, res) => {
  try {
    const { transaction_id } = req.params;
    const userId = req.user.id;

    const transaction = await prisma.orders.findFirst({
      where: {
        id: transaction_id,
        user_id: userId
      },
      include: {
        order_items: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                writer: true,
                publisher: true,
                price: true,
                genre: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Calculate total amount
    const totalAmount = transaction.order_items.reduce((sum: number, item: any) => {
      return sum + (item.book.price * item.quantity);
    }, 0);

    res.json({
      success: true,
      message: 'Get transaction detail successfully',
      data: {
        id: transaction.id,
        items: transaction.order_items.map((item: any) => ({
          book_id: item.book.id,
          book_title: item.book.title,
          quantity: item.quantity,
          subtotal_price: item.book.price * item.quantity
        })),
        total_quantity: transaction.order_items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        total_price: totalAmount
      }
    });
  } catch (error) {
    console.error('Get transaction detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction detail'
    });
  }
});

export default router;
