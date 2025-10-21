import { Request, Response, NextFunction } from 'express';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, username } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  // Password validation
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  next();
};

export const validateBook = (req: Request, res: Response, next: NextFunction) => {
  const { title, writer, publisher, publication_year, price, stock_quantity, genre_id } = req.body;

  if (!title || !writer || !publisher || !publication_year || !price || !stock_quantity || !genre_id) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: title, writer, publisher, publication_year, price, stock_quantity, genre_id'
    });
  }

  if (price <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Price must be greater than 0'
    });
  }

  if (stock_quantity < 0) {
    return res.status(400).json({
      success: false,
      message: 'Stock quantity cannot be negative'
    });
  }

  if (publication_year < 1000 || publication_year > new Date().getFullYear()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid publication year'
    });
  }

  next();
};

export const validateGenre = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Genre name is required'
    });
  }

  if (name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Genre name must be at least 2 characters'
    });
  }

  next();
};

export const validateTransaction = (req: Request, res: Response, next: NextFunction) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Items array is required and must not be empty'
    });
  }

  for (const item of items) {
    if (!item.book_id || !item.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Each item must have book_id and quantity'
      });
    }

    if (item.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }
  }

  next();
};
