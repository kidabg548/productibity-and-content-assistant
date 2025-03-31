import { Task, TimeBlock } from './types';
import { v4 as uuidv4 } from 'uuid';

// Function to add minutes to a time string
function addMinutes(startTime: string, minutes: number): string {
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
    workdayStart: string, 
    workdayEnd: string, 
    pomodoroLength: number = 25, 
    breakLength: number = 5
): TimeBlock[] {
    let currentTime = workdayStart;
    const timeBlocks: TimeBlock[] = [];

    for (const task of tasks) {
        // Calculate end time
        let taskEndTime = addMinutes(currentTime, task.duration);

        // Create a new timeBlock
        timeBlocks.push({
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
            timeBlocks.push({
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