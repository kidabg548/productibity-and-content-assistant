import React, { useState, useEffect } from 'react';
import { useToast } from './ui/use-toast';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
}

const SimpleCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dayEvents = getEventsForDate(currentDate);

      days.push(
        <div
          key={day}
          className={`h-24 p-2 border ${
            currentDate.toDateString() === new Date().toDateString()
              ? 'bg-blue-100'
              : ''
          }`}
        >
          <div className="font-semibold">{day}</div>
          <div className="text-xs space-y-1">
            {dayEvents.map(event => (
              <div
                key={event.id}
                className="bg-blue-200 rounded px-1 truncate"
                title={event.title}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (delta: number) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + delta));
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="px-2 py-1 rounded hover:bg-gray-100"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold">
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </h2>
        <button
          onClick={() => navigateMonth(1)}
          className="px-2 py-1 rounded hover:bg-gray-100"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold p-2">
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>
    </div>
  );
};

export default SimpleCalendar; 