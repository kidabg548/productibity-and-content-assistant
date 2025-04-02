import { SchemaType, Schema, FunctionDeclaration } from '@google/generative-ai';
import { Task, TimeBlock, CalendarEvent } from './types';

export const musicRecommendationFunction = {
    name: "getMusicRecommendations",
    description: "Get music recommendations from Spotify based on the user's mood. Use to provide music tailored to match emotion.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            mood: {
                type: SchemaType.STRING,
                description: "The user's mood (e.g., Happy, Sad, Energetic, Relaxed, Focused, Party, Sleepy, Workout). Important to accurately match music to the mood.",
                enum: ["Happy", "Sad", "Energetic", "Relaxed", "Focused", "Party", "Sleepy", "Workout"],
                format: "enum"
            } as Schema,
        },
        required: ["mood"],
    },
};

export const timeManagementFunction: FunctionDeclaration = {
    name: 'generateTimeBlocks',
    description: 'Generate time blocks for tasks with Pomodoro breaks',
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            workdayStart: {
                type: SchemaType.STRING,
                description: 'Start time of the workday in HH:mm format (24-hour)',
                example: '09:00'
            } as Schema,
            workdayEnd: {
                type: SchemaType.STRING,
                description: 'End time of the workday in HH:mm format (24-hour)',
                example: '17:00'
            } as Schema,
            pomodoroLength: {
                type: SchemaType.NUMBER,
                description: 'Length of each Pomodoro session in minutes',
                example: 25
            } as Schema,
            breakLength: {
                type: SchemaType.NUMBER,
                description: 'Length of breaks between Pomodoro sessions in minutes',
                example: 5
            } as Schema
        },
        required: ['workdayStart', 'workdayEnd', 'pomodoroLength', 'breakLength']
    }
};

export const calendarFunctions: FunctionDeclaration[] = [
    {
        name: 'getCalendarEvents',
        description: 'Get calendar events for a date range. Use this function to fetch events for any calendar query, including "today", "tomorrow", "next week", or specific dates.',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                startDate: {
                    type: SchemaType.STRING,
                    description: 'Start date in ISO 8601 format. For relative dates: "today" = current date, "tomorrow" = current date + 1 day, "next week" = current date + 7 days',
                    example: '2024-03-20T00:00:00Z',
                } as Schema,
                endDate: {
                    type: SchemaType.STRING,
                    description: 'End date in ISO 8601 format. Should be the end of the requested period (e.g., end of day for "today", end of week for "next week")',
                    example: '2024-03-21T00:00:00Z',
                } as Schema,
            },
            required: ['startDate', 'endDate'],
        }
    },
    {
        name: 'createCalendarEvent',
        description: 'Create a new calendar event for a task',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                taskId: {
                    type: SchemaType.STRING,
                    description: 'Name of the task to create an event for (case-insensitive)',
                } as Schema,
                startTime: {
                    type: SchemaType.STRING,
                    description: 'Start time of the event in ISO 8601 format',
                    example: '2024-03-20T10:00:00Z',
                } as Schema,
                endTime: {
                    type: SchemaType.STRING,
                    description: 'End time of the event in ISO 8601 format',
                    example: '2024-03-20T11:00:00Z',
                } as Schema,
                location: {
                    type: SchemaType.STRING,
                    description: 'Optional location for the event',
                } as Schema,
                attendees: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.STRING,
                        description: 'Email address of an attendee',
                    } as Schema,
                    description: 'Optional list of attendee email addresses',
                } as Schema,
            },
            required: ['taskId', 'startTime', 'endTime'],
        }
    },
    {
        name: 'updateCalendarEvent',
        description: 'Update an existing calendar event',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                eventId: {
                    type: SchemaType.STRING,
                    description: 'ID of the calendar event to update',
                } as Schema,
                updates: {
                    type: SchemaType.OBJECT,
                    properties: {
                        summary: {
                            type: SchemaType.STRING,
                            description: 'New title for the event',
                        } as Schema,
                        description: {
                            type: SchemaType.STRING,
                            description: 'New description for the event',
                        } as Schema,
                        startTime: {
                            type: SchemaType.STRING,
                            description: 'New start time in ISO 8601 format',
                        } as Schema,
                        endTime: {
                            type: SchemaType.STRING,
                            description: 'New end time in ISO 8601 format',
                        } as Schema,
                        location: {
                            type: SchemaType.STRING,
                            description: 'New location for the event',
                        } as Schema,
                        attendees: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.STRING,
                                description: 'Email address of an attendee',
                            } as Schema,
                            description: 'New list of attendee email addresses',
                        } as Schema,
                    },
                } as Schema,
            },
            required: ['eventId', 'updates'],
        }
    },
    {
        name: 'deleteCalendarEvent',
        description: 'Delete a calendar event',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                eventId: {
                    type: SchemaType.STRING,
                    description: 'ID of the calendar event to delete',
                } as Schema,
            },
            required: ['eventId'],
        }
    }
];
