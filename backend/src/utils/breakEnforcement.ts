import { TimeBlock } from './types';

interface BreakEnforcement {
    isActive: boolean;
    startTime: Date;
    endTime: Date;
    type: 'screen_lock' | 'notification' | 'browser_tab';
}

// Store active break enforcements
const activeBreaks = new Map<string, BreakEnforcement>();

export function startBreakEnforcement(
    userId: string,
    timeBlock: TimeBlock,
    type: BreakEnforcement['type'] = 'notification'
): BreakEnforcement {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + timeBlock.duration * 60000); // Convert minutes to milliseconds

    const enforcement: BreakEnforcement = {
        isActive: true,
        startTime,
        endTime,
        type
    };

    activeBreaks.set(userId, enforcement);
    return enforcement;
}

export function endBreakEnforcement(userId: string): boolean {
    return activeBreaks.delete(userId);
}

export function getActiveBreak(userId: string): BreakEnforcement | undefined {
    return activeBreaks.get(userId);
}

export function isBreakEnforced(userId: string): boolean {
    const breakEnforcement = activeBreaks.get(userId);
    if (!breakEnforcement) return false;

    const now = new Date();
    if (now > breakEnforcement.endTime) {
        activeBreaks.delete(userId);
        return false;
    }

    return breakEnforcement.isActive;
}

// Function to generate break enforcement instructions based on type
export function generateBreakInstructions(type: BreakEnforcement['type']): string {
    switch (type) {
        case 'screen_lock':
            return 'Your screen will be locked for the break duration. This is for your health and productivity.';
        case 'notification':
            return 'You will receive persistent notifications reminding you to take a break.';
        case 'browser_tab':
            return 'Your browser tabs will be temporarily disabled to encourage a proper break.';
        default:
            return 'Please take a break from your work.';
    }
} 