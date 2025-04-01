import express, { Request, Response, NextFunction } from 'express';
import Task, { ITask } from '../models/task';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateTask } from '../middleware/validation.middleware';

const router = express.Router();

// Get all tasks for the authenticated user
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tasks = await Task.find({ userId: (req as any).userId }).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Create a new task
router.post('/', authMiddleware, validateTask, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = new Task({
      ...req.body,
      userId: (req as any).userId
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// Update a task
router.put('/:id', authMiddleware, validateTask, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: (req as any).userId });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    
    Object.assign(task, req.body);
    await task.save();
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Delete a task
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: (req as any).userId });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router; 