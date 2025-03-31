import { GoogleGenerativeAI } from '@google/generative-ai';

export class EmailSummarizerService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    }

    async summarizeEmails(emails: any[]) {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const summaries = await Promise.all(
                emails.map(async (email) => {
                    const prompt = `
                        Please provide a concise summary of this email:
                        From: ${email.from}
                        Subject: ${email.subject}
                        Body: ${email.body}
                        
                        Include:
                        1. Key points
                        2. Action items (if any)
                        3. Priority level (High/Medium/Low)
                    `;

                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    const text = response.text();

                    return {
                        emailId: email.id,
                        summary: text,
                        metadata: {
                            from: email.from,
                            subject: email.subject,
                            date: email.date
                        }
                    };
                })
            );

            return summaries;
        } catch (error) {
            console.error('Error summarizing emails:', error);
            throw error;
        }
    }

    async generateResponse(email: any, context: string) {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = `
                Please generate a professional email response to:
                From: ${email.from}
                Subject: ${email.subject}
                Body: ${email.body}
                
                Additional context: ${context}
                
                The response should be:
                1. Professional and courteous
                2. Address the key points from the original email
                3. Include any necessary action items or next steps
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return {
                emailId: email.id,
                response: text
            };
        } catch (error) {
            console.error('Error generating email response:', error);
            throw error;
        }
    }

    async analyzePriority(email: any) {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = `
                Please analyze the priority level of this email:
                From: ${email.from}
                Subject: ${email.subject}
                Body: ${email.body}
                
                Consider:
                1. Urgency
                2. Importance
                3. Time sensitivity
                
                Return only one of: HIGH, MEDIUM, or LOW
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const priority = response.text().trim().toUpperCase();

            return {
                emailId: email.id,
                priority,
                metadata: {
                    from: email.from,
                    subject: email.subject,
                    date: email.date
                }
            };
        } catch (error) {
            console.error('Error analyzing email priority:', error);
            throw error;
        }
    }
} 