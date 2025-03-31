import express, { Request, Response } from 'express';
import User from '../models/user';

const router = express.Router();

// Route to create a new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;