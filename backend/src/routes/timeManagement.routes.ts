import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateTimeBlocks } from '../utils/timeManagement';
import { timeManagementFunction } from '../utils/functionDeclarations';
import { Task } from '../utils/types';
import authMiddleware from '../middleware/authMiddleware';
import TaskModel, { ITask } from '../models/task';
import mongoose from 'mongoose';
import { generateSchedule } from '../utils/timeManagement';

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

router.post('/timeManagement', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        
        // Fetch all tasks for the user from the database
        const dbTasks = await TaskModel.find({ userId });
        
        if (!dbTasks || dbTasks.length === 0) {
            res.status(404).json({ 
                message: "No tasks found. Please create some tasks first before generating a schedule." 
            });
            return;
        }

        // Convert database tasks to the format expected by generateTimeBlocks
        const tasks: Task[] = dbTasks.map((task: ITask) => ({
            id: task.id.toString(),
            name: task.name,
            description: task.description || '',
            duration: task.duration,
            dueDate: task.dueDate || new Date().toISOString(),
            complexity: task.complexity || 'Medium',
            startTime: task.startTime,
            endTime: task.endTime,
            isBreak: task.isBreak || false,
            calendarEventId: task.calendarEventId,
            reminderTime: task.reminderTime,
            location: task.location,
            attendees: task.attendees
        }));

        // Create a chat session with function calling capability
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{
                        text: `You are a time management assistant. Help users organize their tasks and create an effective schedule. Consider Pomodoro technique for better focus.`
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
                functionDeclarations: [timeManagementFunction]
            }]
        });

        // Send the user's prompt
        const result = await chat.sendMessage("Please help me schedule these tasks with Pomodoro breaks: " + 
            tasks.map(t => `${t.name} (${t.duration} minutes)`).join(", "));
        const response = await result.response;
        const text = response.text();

        // Check if the response includes a function call
        const functionCall = response.candidates?.[0]?.content?.parts?.[0]?.functionCall;
        
        if (functionCall && functionCall.name === 'generateTimeBlocks') {
            let args;
            try {
                args = typeof functionCall.args === 'string' 
                    ? JSON.parse(functionCall.args)
                    : functionCall.args;
            } catch (error) {
                console.error('Error parsing function arguments:', error);
                throw new Error('Invalid function arguments');
            }
            
            const { workdayStart, workdayEnd, pomodoroLength, breakLength } = args;
            
            // Generate time blocks based on the tasks and parameters
            const timeBlocks = generateTimeBlocks(tasks, workdayStart, workdayEnd, pomodoroLength, breakLength);
            
            // Format the response
            const formattedResponse = {
                explanation: text,
                schedule: timeBlocks,
                tasks: tasks // Include the tasks in the response for reference
            };

            res.json(formattedResponse);
        } else {
            // If no function call was made, return the LLM's response
            res.json({
                message: text,
                note: "No specific schedule was generated. Please try again.",
                tasks: tasks // Include the tasks in the response for reference
            });
        }
    } catch (error: any) {
        console.error('Error processing time management request:', error);
        res.status(500).json({ 
            error: 'Failed to process the request', 
            message: error.message 
        });
    }
});

router.post('/generate-schedule', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        
        // Fetch all tasks for the user from the database
        const dbTasks = await TaskModel.find({ userId });
        
        if (!dbTasks || dbTasks.length === 0) {
            res.status(404).json({ 
                message: "No tasks found. Please create some tasks first before generating a schedule." 
            });
            return;
        }

        // Convert database tasks to the format expected by generateSchedule
        const tasks: Task[] = dbTasks.map((task: ITask) => ({
            id: task.id.toString(),
            name: task.name,
            description: task.description || '',
            duration: task.duration,
            dueDate: task.dueDate || new Date().toISOString(),
            complexity: task.complexity || 'Medium',
            startTime: task.startTime,
            endTime: task.endTime,
            isBreak: task.isBreak || false,
            calendarEventId: task.calendarEventId,
            reminderTime: task.reminderTime,
            location: task.location,
            attendees: task.attendees || []
        }));

        const schedule = await generateSchedule(tasks);
        res.json(schedule);
    } catch (error: any) {
        console.error('Error generating schedule:', error);
        res.status(500).json({ 
            error: 'Failed to generate schedule', 
            message: error.message 
        });
    }
});

export default router;