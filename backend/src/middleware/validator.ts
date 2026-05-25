import { Request, Response, NextFunction } from 'express';

/**
 * Basic generic middleware to ensure the request body is not empty for POST and PUT requests.
 */
export const validateBody = (req: Request, res: Response, next: NextFunction) => {
  if ((req.method === 'POST' || req.method === 'PUT') && Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request body cannot be empty' });
  }
  next();
};

/**
 * Validates that specific required fields are present in the request body.
 * @param requiredFields Array of strings representing required fields.
 */
export const requireFields = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = requiredFields.filter(field => req.body[field] === undefined || req.body[field] === null);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }
    next();
  };
};
