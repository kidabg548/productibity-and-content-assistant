export interface Task {
    id: string;
    name: string;
    duration: number;
}

export interface TimeBlock {
    startTime: string;
    endTime: string;
    task: Task | null;
    isBreak: boolean;
} 