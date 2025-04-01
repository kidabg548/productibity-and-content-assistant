import express, { Request, Response } from 'express';
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, getCalendarEvents } from '../utils/calendar';
import authMiddleware from '../middleware/authMiddleware';
import TaskModel from '../models/task';

const router = express.Router();

// Get calendar events for a date range
router.get('/events', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const accessToken = (req as any).accessToken;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            res.status(400).json({ error: 'Start date and end date are required' });
            return;
        }

        const events = await getCalendarEvents(
            accessToken,
            startDate as string,
            endDate as string
        );

        res.json(events);
    } catch (error: any) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
});

// Update a calendar event
router.patch('/events/:eventId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const accessToken = (req as any).accessToken;
        const { eventId } = req.params;
        const updates = req.body;

        const updatedEvent = await updateCalendarEvent(accessToken, eventId, updates);
        res.json(updatedEvent);
    } catch (error: any) {
        console.error('Error updating calendar event:', error);
        res.status(500).json({ error: 'Failed to update calendar event' });
    }
});

// Delete a calendar event
router.delete('/events/:eventId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const accessToken = (req as any).accessToken;
        const { eventId } = req.params;

        await deleteCalendarEvent(accessToken, eventId);
        
        // Update the associated task to remove the calendar event ID
        await TaskModel.findOneAndUpdate(
            { calendarEventId: eventId },
            { $unset: { calendarEventId: 1 } }
        );

        res.json({ message: 'Calendar event deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting calendar event:', error);
        res.status(500).json({ error: 'Failed to delete calendar event' });
    }
});

// Sync calendar events with tasks
router.post('/sync', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const accessToken = (req as any).accessToken;
        const userId = (req as any).userId;

        // Get all tasks with calendar event IDs
        const tasks = await TaskModel.find({ userId, calendarEventId: { $exists: true } });

        // Update each task's calendar event
        for (const task of tasks) {
            if (task.calendarEventId) {
                await updateCalendarEvent(accessToken, task.calendarEventId, {
                    summary: task.name,
                    description: task.description,
                    start: {
                        dateTime: task.startTime,
                        timeZone: 'UTC'
                    },
                    end: {
                        dateTime: task.endTime,
                        timeZone: 'UTC'
                    },
                    location: task.location,
                    attendees: task.attendees?.map((email: string) => ({ email }))
                });
            }
        }

        res.json({ message: 'Calendar events synced successfully' });
    } catch (error: any) {
        console.error('Error syncing calendar events:', error);
        res.status(500).json({ error: 'Failed to sync calendar events' });
    }
});

export default router; 