import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || err.status || 500;
  console.error(`Error processing request ${req.method} ${req.originalUrl}:`, err);

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'An unexpected error occurred',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
};
