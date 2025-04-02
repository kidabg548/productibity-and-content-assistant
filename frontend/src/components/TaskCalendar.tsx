import React, { useState, useEffect } from 'react';
import { useToast } from './ui/use-toast';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface Task {
    _id: string;
    name: string;
    description?: string;
    dueDate: string;
    duration: number;
    calendarEventId?: string;
    status: 'pending' | 'completed';
    startTime?: string;
    endTime?: string;
}

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    description?: string;
}

interface TaskCalendarProps {
    tasks: Task[];
    renderCalendarEvent?: (eventInfo: any) => React.ReactNode;
}

const TaskCalendar: React.FC<TaskCalendarProps> = ({ tasks: propTasks, renderCalendarEvent }) => {
    const [tasks, setTasks] = useState<Task[]>(propTasks || []);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTask, setNewTask] = useState({
        name: '',
        description: '',
        dueDate: '',
        duration: 30,
    });
    const { toast } = useToast();

    useEffect(() => {
        fetchTasks();
        fetchCalendarEvents();
    }, [selectedDate]);

    useEffect(() => {
        setTasks(propTasks);
    }, [propTasks]);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast({
                    title: 'Error',
                    description: 'Please log in first',
                    variant: 'destructive',
                });
                return;
            }

            const response = await fetch('http://localhost:3000/tasks', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch tasks',
                variant: 'destructive',
            });
        }
    };

    const fetchCalendarEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

            const response = await fetch(
                `http://localhost:3000/calendar/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch calendar events');
            }

            const data = await response.json();
            const formattedEvents = data.map((event: any) => ({
                id: event.id,
                title: event.summary,
                start: new Date(event.start.dateTime || event.start.date),
                end: new Date(event.end.dateTime || event.end.date),
                description: event.description,
            }));

            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching calendar events:', error);
        }
    };

    const handleAddTask = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast({
                    title: 'Error',
                    description: 'Please log in first',
                    variant: 'destructive',
                });
                return;
            }

            const response = await fetch('http://localhost:3000/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...newTask,
                    createCalendarEvent: true,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            const task = await response.json();
            setTasks([...tasks, task]);
            setIsAddingTask(false);
            setNewTask({
                name: '',
                description: '',
                dueDate: '',
                duration: 30,
            });
            fetchCalendarEvents();
            toast({
                title: 'Success',
                description: 'Task created successfully',
            });
        } catch (error) {
            console.error('Error creating task:', error);
            toast({
                title: 'Error',
                description: 'Failed to create task',
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

    const getTasksForDate = (date: Date) => {
        if (!tasks) return [];
        return tasks.filter(task => {
            if (!task.startTime) return false;
            const taskDate = new Date(task.startTime);
            return (
                taskDate.getDate() === date.getDate() &&
                taskDate.getMonth() === date.getMonth() &&
                taskDate.getFullYear() === date.getFullYear()
            );
        });
    };

    const getDayClassName = (currentDate: Date): string => {
        if (currentDate.toDateString() === new Date().toDateString()) {
            return 'bg-blue-50';
        }
        return '';
    };

    const renderDay = (date: Date) => {
        const dayEvents = getEventsForDate(date);
        const dayTasks = getTasksForDate(date);

        return (
            <div
                key={date.toISOString()}
                className={`border p-1 min-h-[120px] text-xs ${getDayClassName(date)}`}
            >
                <div className="font-semibold mb-1">{date.getDate()}</div>
                <div className="space-y-1">
                    {dayEvents.map(event => (
                        <div key={event.id}>
                            {renderCalendarEvent ? renderCalendarEvent(event) : (
                                <div className="bg-blue-100 p-1 rounded">
                                    <h4 className="font-medium">{event.title}</h4>
                                    <p className="text-sm text-gray-600">{event.description}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {dayTasks.map(task => (
                        <div key={task._id} className="bg-green-100 p-1 rounded">
                            <h4 className="font-medium">{task.name}</h4>
                            {task.description && (
                                <p className="text-sm text-gray-600">{task.description}</p>
                            )}
                            <p className="text-xs text-gray-500">
                                Duration: {task.duration} minutes
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
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
            days.push(<div key={`empty-${i}`} className="h-24 p-1"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            days.push(renderDay(currentDate));
        }

        return days;
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const navigateMonth = (delta: number) => {
        const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + delta);
        setSelectedDate(newDate);
    };

    return (
        <div className="space-y-2 w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <Button className="text-sm px-2 py-1" variant="outline" onClick={() => navigateMonth(-1)}>
                        ←
                    </Button>
                    <h2 className="text-md font-semibold">
                        {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </h2>
                    <Button className="text-sm px-2 py-1" variant="outline" onClick={() => navigateMonth(1)}>
                        →
                    </Button>
                </div>
                <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
                    <DialogTrigger asChild>
                        <Button className="text-sm px-2 py-1">Add Task</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Task</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                            <div>
                                <label className="text-sm font-medium">Task Name</label>
                                <Input
                                    value={newTask.name}
                                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                                    placeholder="Enter task name"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    placeholder="Enter task description"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Due Date</label>
                                <Input
                                    type="datetime-local"
                                    value={newTask.dueDate}
                                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Duration (minutes)</label>
                                <Input
                                    type="number"
                                    value={newTask.duration}
                                    onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) })}
                                    min="15"
                                    step="15"
                                />
                            </div>
                            <Button className="text-sm px-2 py-1 w-full" onClick={handleAddTask}>
                                Create Task
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="p-2">
                <div className="grid grid-cols-7 gap-0.5">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-semibold p-1 text-xs">
                            {day}
                        </div>
                    ))}
                    {renderCalendar()}
                </div>
            </Card>
        </div>
    );
};

export default TaskCalendar;