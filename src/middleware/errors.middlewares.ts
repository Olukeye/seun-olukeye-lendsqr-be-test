import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.code,
    });
    return;
  }

  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred'  // Hide details in production
      : err.message,                     // Show details in development
    code: 'INTERNAL_SERVER_ERROR',
  });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    code: 'NOT_FOUND',
  });
};