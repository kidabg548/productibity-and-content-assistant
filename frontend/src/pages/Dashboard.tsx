import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { format } from 'date-fns';

import { 
  MusicalNoteIcon, 
  ClockIcon, 
  ChartBarIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';
import useAuth from '../hooks/useAuth';

interface Task {
    id: string;
    name: string;
    description: string;
    duration: number;
    dueDate: string;
    complexity: 'Easy' | 'Medium' | 'Hard';
}

interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: {
        dateTime: string;
        timeZone: string;
    };
    end: {
        dateTime: string;
        timeZone: string;
    };
}

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [volume, setVolume] = useState(0.5);

    // Fetch tasks
    const { data: tasks, isLoading: isLoadingTasks } = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const response = await api.get('/tasks');
            return response.data;
        }
    });

    // Fetch calendar events
    const { data: calendarEvents, isLoading: isLoadingEvents } = useQuery({
        queryKey: ['calendarEvents'],
        queryFn: async () => {
            const response = await api.get('/calendar/events');
            return response.data;
        }
    });

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    // Music player functions
    const togglePlay = () => setIsPlaying(!isPlaying);
    const nextTrack = () => setCurrentTrack((prev) => (prev + 1) % 3);
    const prevTrack = () => setCurrentTrack((prev) => (prev - 1 + 3) % 3);
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(parseFloat(e.target.value));
    };

    const tracks = [
        { name: 'Lofi Study', artist: 'Lofi Girl' },
        { name: 'Focus Flow', artist: 'Study Music' },
        { name: 'Deep Work', artist: 'Productivity Mix' }
    ];

    const features = [
        {
            name: 'Music Recommendations',
            description: 'Get personalized music recommendations based on your mood and preferences.',
            icon: MusicalNoteIcon,
            link: '/music',
            color: 'bg-indigo-500',
        },
        {
            name: 'Time Management',
            description: 'Organize your tasks and schedule with the Pomodoro technique.',
            icon: ClockIcon,
            link: '/time',
            color: 'bg-green-500',
        },
        {
            name: 'Focus Analytics',
            description: 'Track your productivity and focus metrics over time.',
            icon: ChartBarIcon,
            link: '/analytics',
            color: 'bg-purple-500',
        },
        {
            name: 'Calendar Integration',
            description: 'Sync your schedule with Google Calendar for seamless planning.',
            icon: CalendarIcon,
            link: '/calendar',
            color: 'bg-blue-500',
        },
    ];

    return (
        <div className="bg-gray-900 text-white min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header with Time */}
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-sky-400 mb-2">Welcome Back!</h1>
                    <p className="text-xl text-gray-400">
                        {format(currentTime, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-2xl font-semibold text-gray-300">
                        {format(currentTime, 'h:mm a')}
                    </p>
                </header>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Music Player Card */}
                    <div 
                        className="bg-gray-800 rounded-2xl shadow-lg p-6 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                        onClick={() => navigate('/music')}
                    >
                        <h2 className="text-2xl font-semibold mb-4 text-gray-100">Music Player</h2>
                        <div className="space-y-4">
                            <div className="bg-gray-700 rounded-lg p-4">
                                <p className="text-lg font-medium text-gray-200">{tracks[currentTrack].name}</p>
                                <p className="text-sm text-gray-400">{tracks[currentTrack].artist}</p>
                            </div>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={prevTrack}
                                    className="text-gray-400 hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={togglePlay}
                                    className="bg-sky-500 hover:bg-sky-600 text-white rounded-full p-3"
                                >
                                    {isPlaying ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </button>
                                <button
                                    onClick={nextTrack}
                                    className="text-gray-400 hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828 2.828" />
                                </svg>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 15.364l8.25-4.75" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Task Card */}
                    <div 
                        className="bg-gray-800 rounded-2xl shadow-lg p-6 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                        onClick={() => navigate('/task-management')}
                    >
                        <h2 className="text-2xl font-semibold mb-4 text-gray-100">Tasks</h2>
                        {isLoadingTasks ? (
                            <div className="text-center py-4 text-gray-500">Loading tasks...</div>
                        ) : (
                            <div className="space-y-3">
                                {tasks?.slice(0, 3).map((task: Task) => (
                                    <div key={task.id} className="bg-gray-700 rounded-lg p-3">
                                        <h3 className="text-gray-200 font-medium">{task.name}</h3>
                                        <div className="text-sm text-gray-400 mt-1">
                                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                            <span className="ml-4">Complexity: {task.complexity}</span>
                                        </div>
                                    </div>
                                ))}
                                {tasks && tasks.length > 3 && (
                                    <p className="text-center text-sky-400 mt-2">
                                        +{tasks.length - 3} more tasks...
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Calendar Events Card */}
                    <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-100">Upcoming Events</h2>
                        {isLoadingEvents ? (
                            <div className="text-center py-4 text-gray-500">Loading events...</div>
                        ) : (
                            <div className="space-y-3">
                                {calendarEvents?.slice(0, 3).map((event: CalendarEvent) => (
                                    <div key={event.id} className="bg-gray-700 rounded-lg p-3">
                                        <h3 className="text-gray-200 font-medium">{event.summary}</h3>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {format(new Date(event.start.dateTime), 'MMM d, h:mm a')}
                                        </p>
                                    </div>
                                ))}
                                {calendarEvents && calendarEvents.length > 3 && (
                                    <p className="text-center text-sky-400 mt-2">
                                        +{calendarEvents.length - 3} more events...
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;