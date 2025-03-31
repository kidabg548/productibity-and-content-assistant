import express, { Request, Response } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { 
    startBreakEnforcement, 
    endBreakEnforcement, 
    getActiveBreak,
    isBreakEnforced,
    generateBreakInstructions
} from '../utils/breakEnforcement';
import { TimeBlock } from '../utils/types';

const router = express.Router();

// Start break enforcement
router.post('/start', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { timeBlock, type } = req.body;

        // Check if there's already an active break
        if (isBreakEnforced(userId)) {
            res.status(400).json({ 
                message: "A break is already in progress. Please wait for it to end." 
            });
            return;
        }

        const enforcement = startBreakEnforcement(userId, timeBlock, type);
        const instructions = generateBreakInstructions(type);

        res.json({
            message: "Break enforcement started",
            instructions,
            enforcement
        });
    } catch (error) {
        console.error('Error starting break enforcement:', error);
        res.status(500).json({ error: 'Failed to start break enforcement' });
    }
});

// End break enforcement
router.post('/end', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const ended = endBreakEnforcement(userId);

        if (!ended) {
            res.status(404).json({ message: "No active break found" });
            return;
        }

        res.json({ message: "Break enforcement ended" });
    } catch (error) {
        console.error('Error ending break enforcement:', error);
        res.status(500).json({ error: 'Failed to end break enforcement' });
    }
});

// Get current break status
router.get('/status', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const activeBreak = getActiveBreak(userId);
        const isEnforced = isBreakEnforced(userId);

        res.json({
            isEnforced,
            activeBreak: isEnforced ? activeBreak : null
        });
    } catch (error) {
        console.error('Error getting break status:', error);
        res.status(500).json({ error: 'Failed to get break status' });
    }
});

export default router; 