import express, { Request, Response } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { GmailService } from '../services/gmail.service';
import { EmailSummarizerService } from '../services/emailSummarizer.service';

const router = express.Router();

// Get email summaries
router.get('/summaries', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const limit = parseInt(req.query.limit as string) || 10;
        
        const gmailService = new GmailService(userId);
        const summarizerService = new EmailSummarizerService();
        
        const emails = await gmailService.getRecentEmails(limit);
        const summaries = await summarizerService.summarizeEmails(emails);
        
        res.json(summaries);
    } catch (error) {
        console.error('Error fetching email summaries:', error);
        res.status(500).json({ message: 'Failed to fetch email summaries' });
    }
});

// Generate auto-response
router.post('/auto-response', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { emailId, context } = req.body;
        const userId = req.userId;
        
        const gmailService = new GmailService(userId);
        const summarizerService = new EmailSummarizerService();
        
        const email = await gmailService.getEmail(emailId);
        const response = await summarizerService.generateResponse(email, context);
        
        res.json({ response });
    } catch (error) {
        console.error('Error generating auto-response:', error);
        res.status(500).json({ message: 'Failed to generate auto-response' });
    }
});

// Get email priority
router.get('/priority', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { emailId } = req.query;
        const userId = req.userId;
        
        const gmailService = new GmailService(userId);
        const summarizerService = new EmailSummarizerService();
        
        const email = await gmailService.getEmail(emailId as string);
        const priority = await summarizerService.analyzePriority(email);
        
        res.json({ priority });
    } catch (error) {
        console.error('Error analyzing email priority:', error);
        res.status(500).json({ message: 'Failed to analyze email priority' });
    }
});

export default router; 