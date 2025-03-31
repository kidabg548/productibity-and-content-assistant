import express, { Request, Response } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import Task from '../models/task';

const router = express.Router();

// Create a new task
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, duration } = req.body;
    const userId = (req as any).userId;

    const newTask = new Task({
      userId,
      name,
      duration,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get all tasks for a user
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const tasks = await Task.find({ userId });
    res.json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

// Update a task
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, duration, completed } = req.body;
    const taskId = req.params.id;
    const userId = (req as any).userId;

    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    task.name = name || task.name;
    task.duration = duration || task.duration;
    task.completed = completed !== undefined ? completed : task.completed;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id;
    const userId = (req as any).userId;

    const deletedTask = await Task.findOneAndDelete({ _id: taskId, userId });

    if (!deletedTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router; 