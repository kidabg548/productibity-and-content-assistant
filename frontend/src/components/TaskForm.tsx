// TaskForm.tsx
import React, { useState } from 'react';
import { Task } from '../types';
import api from '../utils/api'; // Import your api utility

interface TaskFormProps {
    onTaskCreated: () => void; // Callback to notify parent component about task creation
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
    const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
        name: '',
        description: '',
        duration: 30,
        dueDate: new Date().toISOString().split('T')[0],
        complexity: 'Medium'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Make the API request to create the task
            await api.post('/tasks', newTask);
            console.log('Task created successfully!');

            // Reset the form
            setNewTask({
                name: '',
                description: '',
                duration: 30,
                dueDate: new Date().toISOString().split('T')[0],
                complexity: 'Medium'
            });

            // Notify the parent component that a task has been created
            onTaskCreated();

        } catch (error: any) {
            console.error('Error creating task:', error);
            // Handle the error, maybe show a toast message
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-300 mb-2">Task Name</label>
                <input
                    type="text"
                    id="name"
                    value={newTask.name}
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-gray-300 border-gray-600 focus:border-sky-500"
                    placeholder="Enter task name"
                    required
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-bold text-gray-300 mb-2">Description</label>
                <textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-gray-300 border-gray-600 focus:border-sky-500"
                    placeholder="Enter task description"
                    rows={3}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="duration" className="block text-sm font-bold text-gray-300 mb-2">Duration (min)</label>
                    <input
                        type="number"
                        id="duration"
                        value={newTask.duration}
                        onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-gray-300 border-gray-600 focus:border-sky-500"
                        min="1"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-bold text-gray-300 mb-2">Due Date</label>
                    <input
                        type="date"
                        id="dueDate"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-gray-300 border-gray-600 focus:border-sky-500"
                        required
                    />
                </div>
            </div>
            <div>
                <label htmlFor="complexity" className="block text-sm font-bold text-gray-300 mb-2">Complexity</label>
                <select
                    id="complexity"
                    value={newTask.complexity}
                    onChange={(e) => setNewTask({ ...newTask, complexity: e.target.value as 'Easy' | 'Medium' | 'Hard' })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-gray-300 border-gray-600 focus:border-sky-500"
                >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>
            <button
                type="submit"
                className="bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
                Add Task
            </button>
        </form>
    );
};

export default TaskForm;