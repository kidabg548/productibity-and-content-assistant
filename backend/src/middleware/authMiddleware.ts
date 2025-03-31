import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';

// Extend the Request interface to include userId
interface AuthRequest extends Request {
  userId?: string;
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ message: 'No token, authorization denied' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId?: string };

    if (!decoded.userId) {
      res.status(401).json({ message: 'Invalid token structure' });
      return;
    }

    // Fetch user from DB
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    req.userId = decoded.userId; // Attach user ID to the request object
    next(); // Proceed to the next middleware
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default authMiddleware;
