import { SchemaType, Schema } from '@google/generative-ai';

export const musicRecommendationFunction = {
    name: "getMusicRecommendations",
    description: "Get music recommendations from Spotify based on the user's mood. Use to provide music tailored to match emotion.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            mood: {
                type: SchemaType.STRING,
                description: "The user's mood (e.g., Happy, Sad, Energetic, Relaxed, Focused, Party, Sleepy, Workout). Important to accurately match music to the mood.",
                enum: ["Happy", "Sad", "Energetic", "Relaxed", "Focused", "Party", "Sleepy", "Workout"],
                format: "enum"
            } as Schema,
        },
        required: ["mood"],
    },
};

export const timeManagementFunction = {
    name: "generateTimeBlocks",
    description: "Generates a time-blocked schedule for a list of tasks, considering Pomodoro breaks. Use this function to help the user stay focused and manage time effectively.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            tasks: {
                type: SchemaType.ARRAY,
                description: "A list of tasks to schedule.",
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        id: {
                            type: SchemaType.STRING,
                            description: "Unique identifier for the task",
                        } as Schema,
                        name: {
                            type: SchemaType.STRING,
                            description: "Task Name"
                        } as Schema,
                        duration: {
                            type: SchemaType.NUMBER,
                            description: "Estimated duration in minutes",
                        } as Schema,
                    },
                    required: ["id", "name", "duration"],
                } as Schema,
            } as Schema,
            workdayStart: {
                type: SchemaType.STRING,
                description: "The start time of the workday (e.g., '9:00')",
            } as Schema,
            workdayEnd: {
                type: SchemaType.STRING,
                description: "The end time of the workday (e.g., '17:00').",
            } as Schema,
            pomodoroLength: {
                type: SchemaType.NUMBER,
                description: "The length of each Pomodoro session in minutes (default is 25).",
            } as Schema,
            breakLength: {
                type: SchemaType.NUMBER,
                description: "The length of the break between Pomodoro sessions in minutes (default is 5).",
            } as Schema,
        },
        required: ["tasks", "workdayStart", "workdayEnd"],
    },
}; 