import express, { Request, Response } from 'express';
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, getCalendarEvents } from '../utils/calendar';
import authMiddleware from '../middleware/authMiddleware';
import TaskModel from '../models/task';
import UserModel from '../models/user';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calendarFunctions } from '../utils/functionDeclarations';
import nodemailer from 'nodemailer';
import { parseDateString, getStartAndEndOfDay } from '../utils/dateUtils';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mutation.forlife06@gmail.com',
        pass: 'lqruxxzlxzogqqfh'
    }
});

// Get calendar events for a date range
router.get('/events', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { startDate, endDate } = req.query;

        console.log('Fetching calendar events for user:', userId);
        console.log('Date range:', { startDate, endDate });

        if (!startDate || !endDate) {
            res.status(400).json({ error: 'Start date and end date are required' });
            return;
        }

        // Get user's access token from database
        const user = await UserModel.findById(userId);
        console.log('User found:', !!user);
        console.log('Has Google access token:', !!user?.googleAccessToken);

        if (!user || !user.googleAccessToken) {
            res.status(401).json({ error: 'Google Calendar not connected. Please authenticate first.' });
            return;
        }

        // Get tasks with calendar event IDs
        const tasksWithEvents = await TaskModel.find({ 
            userId, 
            calendarEventId: { $exists: true } 
        });
        console.log('Tasks with calendar events:', tasksWithEvents.length);

        const events = await getCalendarEvents(user.googleAccessToken, startDate as string, endDate as string);
        console.log('Calendar events found:', events.length);

        // If we have tasks with events but no events returned, there might be an issue
        if (tasksWithEvents.length > 0 && events.length === 0) {
            console.warn('Tasks have calendar event IDs but no events were found in Google Calendar');
        }

        res.json(events);
    } catch (error: any) {
        console.error('Error fetching calendar events:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Failed to fetch calendar events', 
            message: error.message,
            details: error.response?.data || 'No additional details available'
        });
    }
});

// Update a calendar event
router.patch('/events/:eventId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { eventId } = req.params;
        const updates = req.body;

        // Get user's access token from database
        const user = await UserModel.findById(userId);
        if (!user || !user.googleAccessToken) {
            res.status(401).json({ error: 'Google Calendar not connected. Please authenticate first.' });
            return;
        }

        const updatedEvent = await updateCalendarEvent(user.googleAccessToken, eventId, updates);
        res.json(updatedEvent);
    } catch (error: any) {
        console.error('Error updating calendar event:', error);
        res.status(500).json({ error: 'Failed to update calendar event', message: error.message });
    }
});

// Delete a calendar event
router.delete('/events/:eventId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { eventId } = req.params;

        // Get user's access token from database
        const user = await UserModel.findById(userId);
        if (!user || !user.googleAccessToken) {
            res.status(401).json({ error: 'Google Calendar not connected. Please authenticate first.' });
            return;
        }

        await deleteCalendarEvent(user.googleAccessToken, eventId);
        
        // Update the task to remove the calendar event ID
        await TaskModel.findOneAndUpdate(
            { userId, calendarEventId: eventId },
            { $unset: { calendarEventId: 1 } }
        );

        res.json({ message: 'Event deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting calendar event:', error);
        res.status(500).json({ error: 'Failed to delete calendar event', message: error.message });
    }
});

// Sync calendar events with tasks
router.post('/sync', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;

        // Get user's access token from database
        const user = await UserModel.findById(userId);
        if (!user || !user.googleAccessToken) {
            res.status(401).json({ error: 'Google Calendar not connected. Please authenticate first.' });
            return;
        }

        // Get all tasks for the user
        const tasks = await TaskModel.find({ userId });
        console.log('Found tasks to sync:', tasks.length);
        
        let createdEvents = 0;
        let updatedEvents = 0;

        // Process each task
        for (const task of tasks) {
            try {
                if (task.calendarEventId) {
                    // Update existing event
                    await updateCalendarEvent(user.googleAccessToken, task.calendarEventId, {
                        summary: task.name,
                        description: task.description,
                        start: {
                            dateTime: task.startTime || new Date(task.dueDate).toISOString(),
                            timeZone: 'UTC'
                        },
                        end: {
                            dateTime: task.endTime || new Date(new Date(task.dueDate).getTime() + task.duration * 60000).toISOString(),
                            timeZone: 'UTC'
                        }
                    });
                    updatedEvents++;
                } else {
                    // Create new event
                    const startTime = task.startTime || new Date(task.dueDate).toISOString();
                    const endTime = task.endTime || new Date(new Date(task.dueDate).getTime() + task.duration * 60000).toISOString();
                    
                    const event = await createCalendarEvent(user.googleAccessToken, task, {
                        startTime,
                        endTime
                    });

                    // Update task with the new calendar event ID
                    await TaskModel.findByIdAndUpdate(task._id, {
                        calendarEventId: event.id,
                        startTime,
                        endTime
                    });

                    createdEvents++;
                }
            } catch (error) {
                console.error(`Error processing task ${task._id}:`, error);
            }
        }

        res.json({ 
            message: 'Calendar events synced successfully',
            stats: {
                totalTasks: tasks.length,
                createdEvents,
                updatedEvents
            }
        });
    } catch (error: any) {
        console.error('Error syncing calendar events:', error);
        res.status(500).json({ 
            error: 'Failed to sync calendar events', 
            message: error.message,
            details: error.response?.data || 'No additional details available'
        });
    }
});

// LLM-based calendar interaction
router.post('/llm-interaction', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { prompt } = req.body;

        if (!prompt) {
            res.status(400).json({ error: 'Prompt is required' });
            return;
        }

        // Get user's access token from database
        const user = await UserModel.findById(userId);
        if (!user || !user.googleAccessToken) {
            res.status(401).json({ error: 'Google Calendar not connected. Please authenticate first.' });
            return;
        }

        // Get user's tasks
        const tasks = await TaskModel.find({ userId });
        
        // Create a chat session with calendar function calling capability
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{
                        text: `You are a calendar assistant that helps users manage their calendar events and tasks. Here's what you can do:

1. Schedule Tasks:
   - Create calendar events for tasks
   - Use task names to identify tasks (case-insensitive)
   - Set appropriate start and end times based on task duration
   - Example: "Schedule my 'Team Meeting' task for tomorrow at 2 PM"
   - When scheduling, use the task's duration to set the end time
   - For relative dates (today, tomorrow), calculate the actual date

2. View Calendar:
   - Show events for specific dates or date ranges
   - List today's events
   - View upcoming events
   - Example: "Show me my calendar for today" or "What's on my schedule for next week?"

3. Update Events:
   - Move events to different times
   - Update event details
   - Example: "Move my 'Team Meeting' to 3 PM" or "Update the 'Project Review' event location"

4. Delete Events:
   - Remove events from the calendar
   - Example: "Delete the 'Team Meeting' event"

Current Tasks Available:
${tasks.map(t => `- ${t.name} (${t.duration} minutes)`).join('\n')}

Important Guidelines:
- Always use task names (not IDs) when referring to tasks
- For scheduling, provide both start and end times
- Use ISO 8601 format for dates and times
- When moving events, specify the new time clearly
- For date ranges, use start and end dates
- If a task isn't found, list available tasks in the error message
- For relative dates:
  * "today" = current date
  * "tomorrow" = current date + 1 day
  * "next week" = current date + 7 days
- Always use the task's duration to set the end time
- Set reminders for important events (15 minutes before for popup, 30 minutes before for email)`
                    }]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            tools: [{
                functionDeclarations: calendarFunctions
            }]
        });

        // Send the user's prompt
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();

        // Check if the response includes a function call
        const functionCall = response.candidates?.[0]?.content?.parts?.[0]?.functionCall;
        
        if (functionCall) {
            let args;
            try {
                args = typeof functionCall.args === 'string' 
                    ? JSON.parse(functionCall.args)
                    : functionCall.args;
            } catch (error) {
                console.error('Error parsing function arguments:', error);
                throw new Error('Invalid function arguments');
            }

            let result;
            switch (functionCall.name) {
                case 'createCalendarEvent':
                    const task = tasks.find(t => t.name.toLowerCase() === args.taskId.toLowerCase());
                    if (!task) {
                        throw new Error(`Task "${args.taskId}" not found. Available tasks: ${tasks.map(t => t.name).join(', ')}`);
                    }
                    result = await createCalendarEvent(user.googleAccessToken, task, {
                        startTime: args.startTime,
                        endTime: args.endTime
                    });
                    // Update task with calendar event ID
                    await TaskModel.findByIdAndUpdate(task._id, {
                        calendarEventId: result.id,
                        startTime: args.startTime,
                        endTime: args.endTime
                    });
                    break;

                case 'updateCalendarEvent':
                    result = await updateCalendarEvent(user.googleAccessToken, args.eventId, args.updates);
                    break;

                case 'deleteCalendarEvent':
                    await deleteCalendarEvent(user.googleAccessToken, args.eventId);
                    // Update task to remove calendar event ID
                    await TaskModel.findOneAndUpdate(
                        { userId, calendarEventId: args.eventId },
                        { $unset: { calendarEventId: 1 } }
                    );
                    result = { message: 'Event deleted successfully' };
                    break;

                case 'getCalendarEvents':
                    // Parse and format dates
                    const startDate = parseDateString(args.startDate);
                    const endDate = parseDateString(args.endDate);
                    
                    const { start, end } = getStartAndEndOfDay(startDate);
                    result = await getCalendarEvents(user.googleAccessToken, start, end);
                    break;

                default:
                    throw new Error(`Unknown function: ${functionCall.name}`);
            }

            res.json({
                explanation: text,
                result
            });
        } else {
            res.json({
                message: text,
                note: "No calendar action was taken. Please try again with a more specific request."
            });
        }
    } catch (error: any) {
        console.error('Error processing calendar LLM request:', error);
        res.status(500).json({ 
            error: 'Failed to process the request', 
            message: error.message,
            details: error.response?.data || 'No additional details available'
        });
    }
});

// Get smart break suggestions
router.get('/smart-breaks', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        console.log('User ID:', userId);
        
        const user = await UserModel.findById(userId);
        console.log('User found:', !!user);
        console.log('Google Calendar connected:', !!user?.googleAccessToken);
        
        if (!user || !user.googleAccessToken) {
            res.status(401).json({ error: 'Google Calendar not connected' });
            return;
        }

        const tasks = await TaskModel.find({ userId });
        console.log('Found tasks:', tasks.length);
        
        // Get events for the next 7 days
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);
        
        console.log('Fetching events from:', startDate.toISOString(), 'to:', endDate.toISOString());
        const events = await getCalendarEvents(user.googleAccessToken, startDate.toISOString(), endDate.toISOString());
        console.log('Found calendar events:', events.length);
        
        if (events.length === 0) {
            console.log('No events found in the specified date range');
            res.json({
                suggestions: ['No calendar events found for the next 7 days. Add some events to get smart break suggestions.'],
                breakEvents: []
            });
            return;
        }

        // Analyze task patterns
        const taskPatterns = events.reduce((acc: { [key: string]: { count: number; totalDuration: number } }, event) => {
            const taskName = event.summary;
            if (!acc[taskName]) {
                acc[taskName] = { count: 0, totalDuration: 0 };
            }
            acc[taskName].count++;
            acc[taskName].totalDuration += (new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()) / (1000 * 60);
            return acc;
        }, {});

        // Sort events by start time
        const sortedEvents = [...events].sort((a, b) => 
            new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
        );

        // Analyze work patterns
        const workPatterns = {
            longSessions: [] as { start: Date; end: Date; duration: number }[],
            gaps: [] as { start: Date; end: Date; duration: number }[],
            taskDistribution: taskPatterns
        };

        let currentWorkDuration = 0;
        let lastBreakTime = new Date();
        let lastEventEnd = new Date();
        
        for (const event of sortedEvents) {
            const eventStart = new Date(event.start.dateTime);
            const eventEnd = new Date(event.end.dateTime);
            const duration = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60);

            // Check for gaps between events
            const timeSinceLastEvent = (eventStart.getTime() - lastEventEnd.getTime()) / (1000 * 60);
            
            if (timeSinceLastEvent > 15) {
                workPatterns.gaps.push({
                    start: lastEventEnd,
                    end: eventStart,
                    duration: timeSinceLastEvent
                });
                currentWorkDuration = 0;
                lastBreakTime = lastEventEnd;
            }

            if (currentWorkDuration > 240) {
                workPatterns.longSessions.push({
                    start: new Date(lastBreakTime),
                    end: eventStart,
                    duration: currentWorkDuration
                });
            }

            currentWorkDuration += duration;
            lastEventEnd = eventEnd;
        }

        // Use Gemini to generate personalized suggestions
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{
                        text: `You are a productivity and wellness assistant. Analyze the following work patterns and provide personalized suggestions for breaks and schedule optimization:

Work Patterns:
${JSON.stringify(workPatterns, null, 2)}

Please provide:
1. Personalized suggestions based on the work patterns
2. Specific break recommendations with timing
3. Tips for optimizing the schedule
4. Wellness advice based on the task distribution

Format the response as JSON with the following structure:
{
    "suggestions": ["suggestion1", "suggestion2", ...],
    "breakRecommendations": [
        {
            "startTime": "ISO date string",
            "duration": number in minutes,
            "reason": "explanation"
        }
    ],
    "scheduleOptimizations": ["tip1", "tip2", ...],
    "wellnessTips": ["tip1", "tip2", ...]
}`
                    }]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        });

        const result = await chat.sendMessage('Generate personalized suggestions based on the work patterns.');
        const response = await result.response;
        const text = response.text();
        
        let aiSuggestions;
        try {
            // Clean up the response text by removing markdown code block formatting
            const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
            console.log('Cleaned AI response:', cleanText);
            aiSuggestions = JSON.parse(cleanText);
        } catch (error) {
            console.error('Error parsing AI suggestions:', error);
            console.error('Raw AI response:', text);
            aiSuggestions = {
                suggestions: ['Unable to generate personalized suggestions. Please try again later.'],
                breakRecommendations: [],
                scheduleOptimizations: [],
                wellnessTips: []
            };
        }

        // Create break events based on AI recommendations
        const breakEvents: any[] = [];
        for (const recommendation of aiSuggestions.breakRecommendations) {
            try {
                const breakStart = new Date(recommendation.startTime);
                const breakEnd = new Date(breakStart);
                breakEnd.setMinutes(breakEnd.getMinutes() + recommendation.duration);

                const breakEvent = await createCalendarEvent(user.googleAccessToken, {
                    id: '',
                    name: 'Smart Break',
                    description: recommendation.reason,
                    duration: recommendation.duration,
                    dueDate: breakStart.toISOString(),
                    complexity: 'Easy',
                    startTime: breakStart.toISOString(),
                    endTime: breakEnd.toISOString(),
                    isBreak: true,
                    calendarEventId: '',
                    reminderTime: new Date(breakStart.getTime() - 5 * 60000).toISOString(),
                    location: 'Your workspace',
                    attendees: []
                }, {
                    startTime: breakStart.toISOString(),
                    endTime: breakEnd.toISOString()
                });

                breakEvents.push(breakEvent);
            } catch (error) {
                console.error('Error creating break event:', error);
            }
        }

        // Send email with AI-generated suggestions if enabled
        if (user.emailNotifications && user.email) {
            const emailContent = `
                <h2>Your Personalized Schedule Insights</h2>
                
                <h3>Smart Suggestions</h3>
                <ul>
                    ${aiSuggestions.suggestions.map((s: string) => `<li>${s}</li>`).join('')}
                </ul>

                <h3>Schedule Optimizations</h3>
                <ul>
                    ${aiSuggestions.scheduleOptimizations.map((s: string) => `<li>${s}</li>`).join('')}
                </ul>

                <h3>Wellness Tips</h3>
                <ul>
                    ${aiSuggestions.wellnessTips.map((s: string) => `<li>${s}</li>`).join('')}
                </ul>

                ${breakEvents.length > 0 ? `
                    <h3>New Break Events Added</h3>
                    <p>I've added ${breakEvents.length} smart break events to your calendar to help you maintain a healthy schedule.</p>
                    <ul>
                        ${breakEvents.map(event => `
                            <li>${event.summary} at ${new Date(event.start.dateTime).toLocaleTimeString()} 
                                (${event.description})</li>
                        `).join('')}
                    </ul>
                ` : ''}
            `;

            await transporter.sendMail({
                from: 'mutation.forlife06@gmail.com',
                to: user.email,
                subject: 'Your Personalized Schedule Insights',
                html: emailContent
            });
        }

        res.json({
            suggestions: aiSuggestions.suggestions,
            breakEvents,
            scheduleOptimizations: aiSuggestions.scheduleOptimizations,
            wellnessTips: aiSuggestions.wellnessTips
        });
    } catch (error: any) {
        console.error('Error getting smart break suggestions:', error);
        res.status(500).json({ 
            error: 'Failed to get smart break suggestions', 
            message: error.message 
        });
    }
});

export default router; 