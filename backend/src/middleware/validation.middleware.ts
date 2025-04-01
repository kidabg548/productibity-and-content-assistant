import { Request, Response, NextFunction } from 'express';

export const validateTask = (req: Request, res: Response, next: NextFunction): void => {
  const { name, duration, dueDate, complexity, description } = req.body;

  // Validate required fields
  if (!name || !duration || !dueDate || !complexity) {
    res.status(400).json({
      message: 'Missing required fields: name, duration, dueDate, and complexity are required'
    });
    return;
  }

  // Validate duration
  if (typeof duration !== 'number' || duration < 1) {
    res.status(400).json({
      message: 'Duration must be a positive number'
    });
    return;
  }

  // Validate due date
  const dueDateObj = new Date(dueDate);
  if (isNaN(dueDateObj.getTime())) {
    res.status(400).json({
      message: 'Invalid due date format'
    });
    return;
  }

  // Validate complexity
  const validComplexities = ['Easy', 'Medium', 'Hard'];
  if (!validComplexities.includes(complexity)) {
    res.status(400).json({
      message: 'Complexity must be one of: Easy, Medium, Hard'
    });
    return;
  }

  // Validate description (optional)
  if (description && typeof description !== 'string') {
    res.status(400).json({
      message: 'Description must be a string'
    });
    return;
  }

  next();
}; 