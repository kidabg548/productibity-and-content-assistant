import { Task, TimeBlock } from './types';
import { v4 as uuidv4 } from 'uuid';
import { enforceBreaks } from './breakEnforcement';

// Function to add minutes to a time string
function addMinutes(startTime: string | undefined, minutes: number): string {
    if (!startTime) {
        // If no start time provided, use current time
        const now = new Date();
        startTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    const [hours, minutesPart] = startTime.split(':');
    let totalMinutes = parseInt(hours) * 60 + parseInt(minutesPart) + minutes;
    let newHours = Math.floor(totalMinutes / 60) % 24; // Keep within 0-23 range
    let newMinutes = totalMinutes % 60;

    // Pad with leading zeros if necessary
    const formattedHours = String(newHours).padStart(2, '0');
    const formattedMinutes = String(newMinutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
}

export function generateTimeBlocks(
    tasks: Task[],
    workdayStart: string = "09:00",
    workdayEnd: string = "17:00",
    pomodoroLength: number = 25,
    breakLength: number = 5
): TimeBlock[] {
    let currentTime = workdayStart;
    const timeBlocks: TimeBlock[] = [];

    for (const task of tasks) {
        // Calculate end time
        let taskEndTime = addMinutes(currentTime, task.duration);

        const timeBlockId = uuidv4();
        // Create a new timeBlock
        timeBlocks.push({
            id: timeBlockId,
            name: task.name,
            startTime: currentTime,
            endTime: taskEndTime,
            task: task,
            isBreak: false,
            duration: task.duration
        });

        // Setup for next block
        currentTime = taskEndTime;

        // Add a pomodoro break if needed
        if (task.duration >= pomodoroLength) {
            let breakEndTime = addMinutes(currentTime, breakLength);
            const breakBlockId = uuidv4();

            timeBlocks.push({
                id: breakBlockId,
                name: "Break",
                startTime: currentTime,
                endTime: breakEndTime,
                task: null,
                isBreak: true,
                duration: breakLength
            });
            currentTime = breakEndTime;
        }
    }

    return timeBlocks;
}

export async function generateSchedule(tasks: Task[]): Promise<TimeBlock[]> {
    // Sort tasks by due date and complexity
    const sortedTasks = [...tasks].sort((a, b) => {
        const dueDateA = new Date(a.dueDate).getTime();
        const dueDateB = new Date(b.dueDate).getTime();
        if (dueDateA !== dueDateB) return dueDateA - dueDateB;

        // Higher complexity tasks get priority
        const complexityOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        return complexityOrder[b.complexity] - complexityOrder[a.complexity];
    });

    const blocks: TimeBlock[] = [];
    let currentTime = new Date();

    for (const task of sortedTasks) {
        const block: TimeBlock = {
            id: uuidv4(),
            name: task.name,
            startTime: currentTime.toISOString(),
            endTime: new Date(currentTime.getTime() + task.duration * 60000).toISOString(),
            isBreak: false,
            duration: task.duration,
            taskId: task.id,
            taskName: task.name,
            taskDescription: task.description,
            taskComplexity: task.complexity,
            task: task
        };

        blocks.push(block);
        currentTime = new Date(block.endTime);
    }

    return enforceBreaks(blocks);
}