import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleCalendarService {
    private oauth2Client: OAuth2Client;
    private calendar: any;

    constructor(userId: string) {
        this.oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        // In production, you would get the user's tokens from your database
        // For now, we'll use a placeholder
        this.oauth2Client.setCredentials({
            access_token: 'placeholder_access_token',
            refresh_token: 'placeholder_refresh_token'
        });

        this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    }

    async getDailySchedule(date: string) {
        try {
            const response = await this.calendar.events.list({
                calendarId: 'primary',
                timeMin: `${date}T00:00:00Z`,
                timeMax: `${date}T23:59:59Z`,
                singleEvents: true,
                orderBy: 'startTime'
            });

            return response.data.items.map((event: any) => ({
                id: event.id,
                summary: event.summary,
                description: event.description,
                start: event.start.dateTime || event.start.date,
                end: event.end.dateTime || event.end.date,
                location: event.location
            }));
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            throw error;
        }
    }

    async createEvent(event: {
        summary: string;
        description: string;
        startTime: string;
        endTime: string;
        location?: string;
    }) {
        try {
            const response = await this.calendar.events.insert({
                calendarId: 'primary',
                requestBody: {
                    summary: event.summary,
                    description: event.description,
                    start: {
                        dateTime: event.startTime,
                        timeZone: 'UTC'
                    },
                    end: {
                        dateTime: event.endTime,
                        timeZone: 'UTC'
                    },
                    location: event.location
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error creating calendar event:', error);
            throw error;
        }
    }
} 