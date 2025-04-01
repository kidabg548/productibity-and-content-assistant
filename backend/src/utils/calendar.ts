import { google } from 'googleapis';
import { CalendarEvent, Task } from './types';
import { v4 as uuidv4 } from 'uuid';

const calendar = google.calendar('v3');

export async function createCalendarEvent(
    accessToken: string,
    task: Task,
    timeBlock: { startTime: string; endTime: string }
): Promise<CalendarEvent> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const event: CalendarEvent = {
        id: uuidv4(), // Generate a temporary ID
        summary: task.name,
        description: task.description,
        start: {
            dateTime: timeBlock.startTime,
            timeZone: 'UTC',
        },
        end: {
            dateTime: timeBlock.endTime,
            timeZone: 'UTC',
        },
        location: task.location,
        attendees: task.attendees?.map(email => ({ email })),
        reminders: {
            useDefault: false,
            overrides: [
                {
                    method: 'popup',
                    minutes: 15, // 15 minutes before
                },
                {
                    method: 'email',
                    minutes: 30, // 30 minutes before
                }
            ]
        }
    };

    try {
        const response = await calendar.events.insert({
            auth,
            calendarId: 'primary',
            requestBody: event,
            sendUpdates: 'all',
        });

        return {
            ...event,
            id: response.data.id || event.id, // Use the Google Calendar ID if available, otherwise use our generated ID
        };
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw error;
    }
}

export async function updateCalendarEvent(
    accessToken: string,
    eventId: string,
    updates: Partial<CalendarEvent>
): Promise<CalendarEvent> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    try {
        const response = await calendar.events.patch({
            auth,
            calendarId: 'primary',
            eventId,
            requestBody: updates,
            sendUpdates: 'all',
        });

        return response.data as CalendarEvent;
    } catch (error) {
        console.error('Error updating calendar event:', error);
        throw error;
    }
}

export async function deleteCalendarEvent(
    accessToken: string,
    eventId: string
): Promise<void> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    try {
        await calendar.events.delete({
            auth,
            calendarId: 'primary',
            eventId,
            sendUpdates: 'all',
        });
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        throw error;
    }
}

export async function getCalendarEvents(
    accessToken: string,
    timeMin: string,
    timeMax: string
): Promise<CalendarEvent[]> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    try {
        const response = await calendar.events.list({
            auth,
            calendarId: 'primary',
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: 'startTime',
        });

        return response.data.items as CalendarEvent[];
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        throw error;
    }
} 