import { v4 as uuidv4 } from 'uuid';

interface PomodoroSession {
    id: string;
    userId: string;
    task: string;
    duration: number;
    startTime: Date;
    endTime?: Date;
    status: 'active' | 'completed' | 'interrupted';
}

export class PomodoroService {
    private sessions: Map<string, PomodoroSession>;

    constructor(userId: string) {
        this.sessions = new Map();
    }

    async startSession(duration: number, task: string): Promise<PomodoroSession> {
        const session: PomodoroSession = {
            id: uuidv4(),
            userId: this.userId,
            task,
            duration,
            startTime: new Date(),
            status: 'active'
        };

        this.sessions.set(session.id, session);
        return session;
    }

    async endSession(sessionId: string): Promise<PomodoroSession> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }

        session.endTime = new Date();
        session.status = 'completed';
        return session;
    }

    async getDailyMetrics(date: string): Promise<{
        totalSessions: number;
        totalFocusTime: number;
        completedSessions: number;
        averageSessionDuration: number;
    }> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const dailySessions = Array.from(this.sessions.values()).filter(
            session => session.startTime >= startOfDay && session.startTime <= endOfDay
        );

        const totalFocusTime = dailySessions.reduce(
            (acc, session) => acc + (session.endTime ? session.endTime.getTime() - session.startTime.getTime() : 0),
            0
        );

        return {
            totalSessions: dailySessions.length,
            totalFocusTime,
            completedSessions: dailySessions.filter(s => s.status === 'completed').length,
            averageSessionDuration: dailySessions.length > 0 ? totalFocusTime / dailySessions.length : 0
        };
    }
} 