import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { logger } from '../utils/logger';

// Generic validation middleware
export const validate = (schema: ZodSchema, type: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[type];
      const validatedData = schema.parse(data);
      
      // Replace the request data with the validated data
      req[type] = validatedData;
      
      next();
    } catch (error: any) {
      logger.debug(`Validation error: ${error.message}`);
      
      // Format Zod validation errors
      if (error.errors) {
        const formattedErrors = error.errors.map((err: any) => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          message: 'Validation failed',
          errors: formattedErrors
        });
      }
      
      return res.status(400).json({ message: 'Invalid input data' });
    }
  };
};
