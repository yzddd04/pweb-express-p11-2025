import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Import routes
import { authRoutes, bookRoutes, genreRoutes, transactionRoutes } from './routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/genre', genreRoutes);
app.use('/transactions', transactionRoutes);

// Health check endpoint
app.get('/health-check', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Hello World!', 
    date: new Date().toDateString() 
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 IT Literature Shop API is ready!`);
});

// Export prisma for use in other files
export { default as prisma } from './lib/prisma';
