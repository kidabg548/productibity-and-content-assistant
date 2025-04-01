import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../utils/api';

interface CalendarEvent {
    id: string;
    summary: string;
    description: string;
    start: {
        dateTime: string;
        timeZone: string;
    };
    end: {
        dateTime: string;
        timeZone: string;
    };
    location?: string;
    attendees?: Array<{
        email: string;
        displayName?: string;
    }>;
}

const CalendarIntegration: React.FC = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const today = new Date();
            const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            
            const response = await api.get('/calendar/events', {
                params: {
                    startDate: today.toISOString(),
                    endDate: nextWeek.toISOString()
                }
            });
            
            setEvents(response.data);
        } catch (err) {
            setError('Failed to fetch calendar events');
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    const syncCalendar = async () => {
        try {
            setLoading(true);
            await api.post('/calendar/sync');
            await fetchEvents();
        } catch (err) {
            setError('Failed to sync calendar');
            console.error('Error syncing calendar:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    if (loading) return <div className="text-center py-4">Loading calendar events...</div>;
    if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Calendar Events</h2>
                <button
                    onClick={syncCalendar}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors"
                >
                    Sync Calendar
                </button>
            </div>
            
            <div className="space-y-4">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="bg-gray-700 rounded-md p-4"
                    >
                        <h3 className="text-lg font-medium text-white">{event.summary}</h3>
                        <p className="text-gray-300 text-sm mt-1">{event.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                            <span>
                                {format(new Date(event.start.dateTime), 'MMM d, h:mm a')} - 
                                {format(new Date(event.end.dateTime), 'h:mm a')}
                            </span>
                            {event.location && (
                                <span>📍 {event.location}</span>
                            )}
                            {event.attendees && event.attendees.length > 0 && (
                                <span>👥 {event.attendees.length} attendees</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarIntegration; 