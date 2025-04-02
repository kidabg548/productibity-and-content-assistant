// Helper function to format date for Google Calendar API
export function formatDateForAPI(date: Date): string {
    return date.toISOString().replace('Z', '+00:00');
}

// Helper function to get start and end of day
export function getStartAndEndOfDay(date: Date): { start: string; end: string } {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return {
        start: formatDateForAPI(start),
        end: formatDateForAPI(end)
    };
}

// Helper function to parse date string
export function parseDateString(dateStr: string): Date {
    // Handle relative dates
    if (dateStr === 'today') {
        return new Date();
    } else if (dateStr === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    } else if (dateStr === 'next week') {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek;
    } else if (dateStr === 'next day') {
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        return nextDay;
    }

    // Try to parse the date string
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${dateStr}`);
    }
    return date;
} 