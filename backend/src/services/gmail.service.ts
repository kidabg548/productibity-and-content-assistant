import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GmailService {
    private oauth2Client: OAuth2Client;
    private gmail: any;

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

        this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    }

    async getRecentEmails(limit: number = 10) {
        try {
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                maxResults: limit
            });

            const emails = await Promise.all(
                response.data.messages.map(async (message: any) => {
                    const email = await this.getEmail(message.id);
                    return email;
                })
            );

            return emails;
        } catch (error) {
            console.error('Error fetching recent emails:', error);
            throw error;
        }
    }

    async getEmail(emailId: string) {
        try {
            const response = await this.gmail.users.messages.get({
                userId: 'me',
                id: emailId
            });

            return this.parseEmail(response.data);
        } catch (error) {
            console.error('Error fetching email:', error);
            throw error;
        }
    }

    private parseEmail(email: any) {
        const headers = email.payload.headers;
        const subject = headers.find((h: any) => h.name === 'Subject')?.value;
        const from = headers.find((h: any) => h.name === 'From')?.value;
        const date = headers.find((h: any) => h.name === 'Date')?.value;

        let body = '';
        if (email.payload.parts) {
            const textPart = email.payload.parts.find((part: any) => part.mimeType === 'text/plain');
            if (textPart) {
                body = Buffer.from(textPart.body.data, 'base64').toString();
            }
        } else if (email.payload.body.data) {
            body = Buffer.from(email.payload.body.data, 'base64').toString();
        }

        return {
            id: email.id,
            subject,
            from,
            date,
            body,
            snippet: email.snippet
        };
    }
} 