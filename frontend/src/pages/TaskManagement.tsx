import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parse, isValid } from 'date-fns';
import api from '../utils/api';
import CalendarIntegration from '../components/CalendarIntegration';
import { motion } from 'framer-motion';

interface Task {
    id: string;
    name: string;
    description: string;
    duration: number;
    dueDate: string;
    complexity: 'Easy' | 'Medium' | 'Hard';
    startTime?: string;
    endTime?: string;
    isBreak?: boolean;
}

interface TimeBlock {
    startTime: string;
    endTime: string;
    task: Task | null;
    isBreak: boolean;
    duration: number;
}

interface TimeManagementResponse {
    explanation: string;
    schedule: TimeBlock[];
    tasks: Task[];
}

const TaskManagement = () => {
    const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
        name: '',
        description: '',
        duration: 30,
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        complexity: 'Medium'
    });
    const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);
    const queryClient = useQueryClient();

    // Fetch tasks
    const { data: tasks, isLoading: isLoadingTasks } = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const response = await api.get('/tasks');
            return response.data;
        }
    });

    // Create task mutation
    const createTaskMutation = useMutation({
        mutationFn: async (task: Omit<Task, 'id'>) => {
            const response = await api.post('/tasks', task);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setNewTask({
                name: '',
                description: '',
                duration: 30,
                dueDate: format(new Date(), 'yyyy-MM-dd'),
                complexity: 'Medium'
            });
        }
    });

    // Delete task mutation
    const deleteTaskMutation = useMutation({
        mutationFn: async (taskId: string) => {
            await api.delete(`/tasks/${taskId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });

    // Generate schedule mutation
    const generateScheduleMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post('/llm/timeManagement');
            return response.data as TimeManagementResponse;
        },
        onSuccess: () => {
            setIsGeneratingSchedule(false);
            setShowSchedule(true);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTask.name.trim()) {
            createTaskMutation.mutate(newTask);
        }
    };

    const handleGenerateSchedule = () => {
        setIsGeneratingSchedule(true);
        generateScheduleMutation.mutate();
    };

    const formatTime = (timeString: string) => {
        try {
            const parsedTime = parse(timeString, 'HH:mm', new Date());
            if (isValid(parsedTime)) {
                return format(parsedTime, 'h:mm a');
            }
            return 'Invalid time';
        } catch (error) {
            console.error('Error formatting time:', error);
            return 'Invalid time';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                <h1 className="text-3xl font-bold mb-8 text-center text-white">Task Management</h1>

                {/* Main Content Grid */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Task Creation Form */}
                    <motion.div
                        className="bg-gray-800 rounded-lg shadow-md p-4"
                        whileHover={{ scale: 1.02 }}
                    >
                        <h2 className="text-xl font-semibold mb-2 text-gray-200">Add Task</h2>
                        <form onSubmit={handleSubmit} className="space-y-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Task Name</label>
                                <input
                                    type="text"
                                    value={newTask.name}
                                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white text-sm"
                                    placeholder="Task name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white text-sm"
                                    placeholder="Description"
                                    rows={2}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Duration (min)</label>
                                    <input
                                        type="number"
                                        value={newTask.duration}
                                        onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) })}
                                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white text-sm"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Complexity</label>
                                <select
                                    value={newTask.complexity}
                                    onChange={(e) => setNewTask({ ...newTask, complexity: e.target.value as 'Easy' | 'Medium' | 'Hard' })}
                                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white text-sm"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-sky-500 text-white py-2 px-4 rounded-md hover:bg-sky-600 transition-colors text-sm"
                            >
                                Add
                            </button>
                        </form>
                    </motion.div>

                    {/* Task List */}
                    <motion.div
                        className="bg-gray-800 rounded-lg shadow-md p-4"
                        whileHover={{ scale: 1.02 }}
                    >
                        <h2 className="text-xl font-semibold mb-4 text-gray-200">Tasks</h2>
                        {isLoadingTasks ? (
                            <div className="text-center py-2 text-gray-500">Loading...</div>
                        ) : tasks?.length === 0 ? (
                            <div className="text-center py-2 text-gray-500">No tasks yet.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tasks?.map((task: Task) => (
                                    <div
                                        key={task.id}
                                        className="bg-gray-700 rounded-lg p-3 flex flex-col justify-between"
                                    >
                                        <div>
                                            <h3 className="font-medium text-gray-100">{task.name}</h3>
                                            <p className="text-sm text-gray-400">{task.description}</p>
                                            <p className="text-xs text-gray-500">Duration: {task.duration} minutes</p>
                                        </div>
                                        <div className="mt-2 flex justify-end">
                                            <button
                                                onClick={() => deleteTaskMutation.mutate(task.id)}
                                                className="text-red-500 hover:text-red-400 text-sm focus:outline-none"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Schedule and Calendar */}
                    <div className="space-y-6">
                        {/* Schedule Section */}
                        <motion.div
                            className="bg-gray-800 rounded-lg shadow-md p-4"
                            whileHover={{ scale: 1.02 }}
                        >
                            <h2 className="text-xl font-semibold mb-4 text-gray-200">Generate Schedule</h2>
                            <div className="flex items-center justify-center">
                                <button
                                    onClick={handleGenerateSchedule}
                                    disabled={isGeneratingSchedule || !tasks?.length}
                                    className={`px-4 py-2 rounded-md text-sm ${isGeneratingSchedule || !tasks?.length
                                        ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                        }`}
                                >
                                    {isGeneratingSchedule ? 'Generating...' : 'Generate'}
                                </button>
                            </div>
                        </motion.div>

                        {/* Schedule Display */}
                        {generateScheduleMutation.data && showSchedule && (
                            <div
                                className="bg-gray-800 rounded-lg shadow-md p-4"
                            >
                                <h2 className="text-xl font-semibold mb-4 text-gray-200">Schedule</h2>
                                <p className="text-gray-400 mb-4">{generateScheduleMutation.data.explanation}</p>
                                <div className="space-y-2">
                                    {generateScheduleMutation.data.schedule.map((block: TimeBlock, index: number) => (
                                        <div
                                            key={index} //Use index as key since block.id might not be unique
                                            className={`p-3 rounded-lg ${block.isBreak ? 'bg-yellow-900' : 'bg-sky-900'} text-white`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    {block.isBreak ? (
                                                        <h3 className="font-medium">Break</h3>
                                                    ) : (
                                                        <h3 className="font-medium">{block.task?.name}</h3>
                                                    )}
                                                    <p className="text-sm text-gray-300">
                                                        {formatTime(block.startTime)} - {formatTime(block.endTime)}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${block.isBreak ? 'bg-yellow-700 text-yellow-200' : 'bg-sky-700 text-sky-200'
                                                        }`}
                                                >
                                                    {block.isBreak ? 'Break' : 'Task'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Calendar Integration */}
                        <CalendarIntegration />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TaskManagement;