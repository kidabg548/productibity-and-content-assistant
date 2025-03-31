import express, { Request, Response } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { GoogleCalendarService } from '../services/googleCalendar.service';
import { PomodoroService } from '../services/pomodoro.service';

const router = express.Router();

// Get user's schedule for the day
router.get('/schedule', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const date = req.query.date as string || new Date().toISOString().split('T')[0];
        
        const calendarService = new GoogleCalendarService(userId);
        const schedule = await calendarService.getDailySchedule(date);
        
        res.json(schedule);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ message: 'Failed to fetch schedule' });
    }
});

// Start a Pomodoro session
router.post('/pomodoro/start', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { duration, task } = req.body;
        const userId = req.userId;
        
        const pomodoroService = new PomodoroService(userId);
        const session = await pomodoroService.startSession(duration, task);
        
        res.json(session);
    } catch (error) {
        console.error('Error starting Pomodoro session:', error);
        res.status(500).json({ message: 'Failed to start Pomodoro session' });
    }
});

// End a Pomodoro session
router.post('/pomodoro/end', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.body;
        const userId = req.userId;
        
        const pomodoroService = new PomodoroService(userId);
        const session = await pomodoroService.endSession(sessionId);
        
        res.json(session);
    } catch (error) {
        console.error('Error ending Pomodoro session:', error);
        res.status(500).json({ message: 'Failed to end Pomodoro session' });
    }
});

// Get focus metrics
router.get('/metrics', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const date = req.query.date as string || new Date().toISOString().split('T')[0];
        
        const pomodoroService = new PomodoroService(userId);
        const metrics = await pomodoroService.getDailyMetrics(date);
        
        res.json(metrics);
    } catch (error) {
        console.error('Error fetching focus metrics:', error);
        res.status(500).json({ message: 'Failed to fetch focus metrics' });
    }
});

export default router; 