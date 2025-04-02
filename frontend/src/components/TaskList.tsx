import React from 'react';
import { Task } from '../types';

interface TaskListProps {
    tasks: Task[] | undefined;
    onDelete: (taskId: string) => void;
    onEdit: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks = [], onDelete, onEdit }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-300 mb-4">Tasks</h2>
            {!tasks || tasks.length === 0 ? (
                <p className="text-gray-400">No tasks yet. Add one to get started!</p>
            ) : (
                <div className="space-y-4">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="bg-gray-700 rounded-xl p-4 shadow-lg hover:bg-gray-600 transition-colors duration-200"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-200">{task.name}</h3>
                                    <p className="text-gray-400 mt-1">{task.description}</p>
                                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-400">
                                        <span>Duration: {task.duration} min</span>
                                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                        <span>Complexity: {task.complexity}</span>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => onEdit(task)}
                                        className="text-sky-400 hover:text-sky-300"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(task.id)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaskList; 