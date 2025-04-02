import React, { useState, useEffect } from 'react';
import { Calendar } from './ui/calendar';
import { Card } from './ui/card';
import { useToast } from './ui/use-toast';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
}

const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const fetchCalendarEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Error',
          description: 'Please connect your Google Calendar first',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('http://localhost:3000/calendar/events', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const data = await response.json();
      const formattedEvents = data.events.map((event: any) => ({
        id: event.id,
        title: event.summary,
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        description: event.description,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch calendar events',
        variant: 'destructive',
      });
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-md border"
      />
      
      {selectedDate && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">
            Events for {selectedDate.toLocaleDateString()}
          </h3>
          <div className="space-y-2">
            {getEventsForDate(selectedDate).map(event => (
              <div
                key={event.id}
                className="p-2 bg-gray-100 rounded-md text-sm"
              >
                <div className="font-medium">{event.title}</div>
                <div className="text-gray-600">
                  {new Date(event.start).toLocaleTimeString()} - 
                  {new Date(event.end).toLocaleTimeString()}
                </div>
                {event.description && (
                  <div className="text-gray-500 mt-1">{event.description}</div>
                )}
              </div>
            ))}
            {getEventsForDate(selectedDate).length === 0 && (
              <div className="text-gray-500 text-sm">No events for this date</div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CalendarView; 