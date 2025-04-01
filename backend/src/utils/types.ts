export interface Task {
    id: string;
    name: string;
    description: string;
    duration: number;
    dueDate: string;
    complexity: 'Easy' | 'Medium' | 'Hard';
    startTime?: string;
    endTime?: string;
    isBreak?: boolean;
    calendarEventId?: string;  // Reference to the calendar event
    reminderTime?: string;     // When to send reminder
    location?: string;         // Optional location for the task
    attendees?: string[];      // Optional attendees for the task
}

export interface TimeBlock {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    isBreak: boolean;
    duration: number;
    taskId?: string;
    taskName?: string;
    taskDescription?: string;
    taskComplexity?: 'Easy' | 'Medium' | 'Hard';
    task?: Task | null;
}

export interface CalendarEvent {
    id: string;
    summary: string;
    description: string;
    start: {
        dateTime: string;
        timeZone: string;
    };
    end: {
        dateTime: string;
        timeZone: string;
    };
    location?: string;
    attendees?: Array<{
        email: string;
        displayName?: string;
    }>;
    reminders?: {
        useDefault: boolean;
        overrides: Array<{
            method: 'email' | 'popup';
            minutes: number;
        }>;
    };
}

export interface TimeManagementResponse {
    explanation: string;
    schedule: TimeBlock[];
    tasks: Task[];
    calendarEvents: CalendarEvent[];
} 