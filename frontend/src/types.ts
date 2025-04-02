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
    calendarEventId?: string;
    reminderTime?: string;
    location?: string;
    attendees?: string[];
} 