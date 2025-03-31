import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Register Route
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Create new user
    const newUser = new User({ firstName, lastName, email, password });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login Route
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (error: any) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});



export default router;