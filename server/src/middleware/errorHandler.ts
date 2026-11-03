import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log internal error for developer debugging
  console.error('Unhandled Application Error:', err);

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    res.status(409).json({
      success: false,
      message: `An account with this ${field} already exists.`,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((e: any) => e.message);
    res.status(400).json({
      success: false,
      message: messages.join(', ') || 'Validation error occurred.',
    });
    return;
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: `Invalid ID format for resource: ${err.value}`,
    });
    return;
  }

  // Custom status or default to 500
  const statusCode = err.statusCode || err.status || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred. Please try again.'
      : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
  });
}
