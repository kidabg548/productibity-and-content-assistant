import { SchemaType, Schema, FunctionDeclaration } from '@google/generative-ai';

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

export const timeManagementFunction: FunctionDeclaration = {
    name: "generateTimeBlocks",
    description: "Generate a time-blocked schedule for the given tasks, including appropriate breaks",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            tasks: {
                type: SchemaType.ARRAY,
                description: "Array of tasks to schedule",
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        name: {
                            type: SchemaType.STRING,
                            description: "Name of the task"
                        } as Schema,
                        duration: {
                            type: SchemaType.NUMBER,
                            description: "Duration of the task in minutes"
                        } as Schema,
                        dueDate: {
                            type: SchemaType.STRING,
                            description: "Due date of the task"
                        } as Schema,
                        complexity: {
                            type: SchemaType.STRING,
                            description: "Complexity level of the task (Easy, Medium, Hard)",
                            format: "enum",
                            enum: ["Easy", "Medium", "Hard"]
                        } as Schema,
                        description: {
                            type: SchemaType.STRING,
                            description: "Description of the task"
                        } as Schema
                    },
                    required: ["name", "duration", "dueDate", "complexity"]
                } as Schema
            },
            workdayStart: {
                type: SchemaType.STRING,
                description: "Start time of the workday (HH:mm format)"
            } as Schema,
            workdayEnd: {
                type: SchemaType.STRING,
                description: "End time of the workday (HH:mm format)"
            } as Schema
        },
        required: ["tasks"]
    }
}; 