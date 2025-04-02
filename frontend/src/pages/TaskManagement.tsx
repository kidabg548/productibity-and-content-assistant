import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addMinutes } from 'date-fns';
import api from '../utils/api';
import TaskCalendar from '../components/TaskCalendar';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TaskForm from '../components/TaskForm';

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
    calendarEventId?: string;
}

interface TimeBlock {
    taskName: string;
    startTime: string;
    endTime: string;
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

// Add new interface for smart breaks response
interface SmartBreaksResponse {
    suggestions: string[];
    breakEvents: CalendarEvent[];
    scheduleOptimizations: string[];
    wellnessTips: string[];
}

// Add new mutation hook for smart breaks
const useSmartBreaksMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const response = await api.get('/calendar/smart-breaks');
            return response.data as SmartBreaksResponse;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
            toast.success('Schedule insights generated successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });
};

const TaskManagement = () => {
    const queryClient = useQueryClient();
    const [calendarSyncing, setCalendarSyncing] = useState(false);
    const [llmPrompt, setLlmPrompt] = useState('');
    const [llmResult, setLlmResult] = useState<any>(null);
    const [generatedSchedule, setGeneratedSchedule] = useState<TimeBlock[] | null>(null);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [showSmartBreaks, setShowSmartBreaks] = useState(false);
    const [smartBreaksData, setSmartBreaksData] = useState<SmartBreaksResponse | null>(null);
    const smartBreaksMutation = useSmartBreaksMutation();

    // Fetch tasks
    const { data: tasks, isLoading: isLoadingTasks, error: fetchTasksError } = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const response = await api.get('/tasks');
            return response.data;
        }
    });

    useEffect(() => {
        if (fetchTasksError) {
            toast.error(`Error fetching tasks: ${fetchTasksError.message}`);
        }
    }, [fetchTasksError]);

    //Sync Calendar Mutation
    const syncCalendarMutation = useMutation({
        mutationFn: async () => {
            setCalendarSyncing(true);
            const response = await api.post('/calendar/sync');
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success(`Calendar synced successfully! Created: ${data.stats.createdEvents}, Updated: ${data.stats.updatedEvents}`);
        },
        onError: (error: any) => {
            toast.error(`Error syncing calendar: ${error.message}`);
        },
        onSettled: () => {
            setCalendarSyncing(false);
        }
    });

    //LLM interaction Mutation
    const llmInteractionMutation = useMutation({
        mutationFn: async (prompt: string) => {
            const response = await api.post('/calendar/llm-interaction', { prompt });
            return response.data;
        },
        onSuccess: (data) => {
            setLlmResult(data);
            if (data.result && Array.isArray(data.result)) {
                setCalendarEvents(data.result);
            }
            queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Refresh tasks after LLM interaction
            toast.success('LLM interaction successful!');
        },
        onError: (error: any) => {
            toast.error(`Error during LLM interaction: ${error.message}`);
            setLlmResult({ error: error.message });
        }
    });


    const handleSyncCalendar = () => {
        syncCalendarMutation.mutate();
    };

    const handleLlmInteraction = () => {
        if (llmPrompt.trim()) {
            llmInteractionMutation.mutate(llmPrompt);
        } else {
            toast.warn('Please enter a prompt for LLM interaction.');
        }
    };

    const handleTaskCalendarEventChange = async (taskId: string, newStartTime: Date) => {
      // Find the task by its ID
      const taskToUpdate = tasks?.find((task: Task) => task.id === taskId);

      if (!taskToUpdate) {
          console.error(`Task with ID ${taskId} not found.`);
          toast.error(`Task with ID ${taskId} not found.`);
          return;
      }

      // Calculate the new end time based on the task's duration and the new start time
      const newEndTime = addMinutes(new Date(newStartTime), taskToUpdate.duration).toISOString();
      const newStartTimeISO = newStartTime.toISOString();

      try {
          // Update the task on the server
          await api.patch(`/tasks/${taskId}`, {
              startTime: newStartTimeISO,
              endTime: newEndTime
          });

          // Manually update the task in the React Query cache
          queryClient.setQueryData(['tasks'], (oldTasks: any) =>
              oldTasks?.map((task: Task) =>
                  task.id === taskId ? { ...task, startTime: newStartTimeISO, endTime: newEndTime } : task
              )
          );

          toast.success(`Task "${taskToUpdate.name}" updated on calendar.`);
      } catch (error: any) {
          console.error('Error updating task:', error);
          toast.error(`Failed to update task "${taskToUpdate.name}": ${error.message}`);
      }
  };

    // Time Management and Schedule Generation
    const generateTimeManagementSchedule = async () => {
        try {
            const response = await api.post('/llm/timeManagement');
            setGeneratedSchedule(response.data.schedule);
            toast.success('Time management schedule generated successfully!');
        } catch (error: any) {
            console.error('Error generating time management schedule:', error);
            toast.error(`Failed to generate time management schedule: ${error.message}`);
        }
    };

    const generateOptimalSchedule = async () => {
        try {
            const response = await api.post('/llm/generate-schedule');
            setGeneratedSchedule(response.data);
            toast.success('Optimal schedule generated successfully!');
        } catch (error: any) {
            console.error('Error generating optimal schedule:', error);
            toast.error(`Failed to generate optimal schedule: ${error.message}`);
        }
    };

    const handleSmartBreaksClick = async () => {
        try {
            const result = await smartBreaksMutation.mutateAsync();
            setSmartBreaksData(result);
            setShowSmartBreaks(true);
        } catch (error) {
            console.error('Error getting smart breaks:', error);
            toast.error('Failed to get smart break suggestions');
        }
    };

    const handleTaskCreated = () => {
        // Invalidate the tasks query to refresh the task list
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
    };

    const renderCalendarEvent = (eventInfo: any) => {
        // Customize how events are displayed on the calendar here
        return (
            <div
                style={{
                    backgroundColor: 'rgba(100, 149, 237, 0.7)', // Cornflower Blue with transparency
                    color: 'white',
                    padding: '2px',
                    borderRadius: '3px',
                    fontSize: '0.75em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textAlign: 'center',
                }}
            >
                {eventInfo.summary}
            </div>
        );
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen p-6 flex flex-col">
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold text-center text-sky-400">
                    Task Management
                </h1>
            </header>

            <main className="flex flex-col gap-8 w-full">
                {/* Task Creation and List Section */}
                <section className="flex lg:flex-row gap-8">
                    {/* Task Creation Form */}
                    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 w-full lg:w-1/2">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-100">Add New Task</h2>
                        <div className="mb-8">
                            <TaskForm onTaskCreated={handleTaskCreated} />
                        </div>
                    </div>

                    {/* Always show Tasks in a card format*/}
                    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 w-full lg:w-1/2">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-100">Tasks</h2>
                        {isLoadingTasks ? (
                            <div className="text-center py-4 text-gray-500">Loading tasks...</div>
                        ) : (
                            <div className="mb-8">
                                <div className="flex flex-wrap gap-2"> {/* Reduced gap */}
                                    {tasks?.map((task: Task) => (
                                        <div
                                            key={task.id}
                                            className="bg-gray-700 rounded-xl p-2 w-32 flex flex-col justify-between hover:bg-gray-600 transition-colors duration-200"  // Smaller width, reduced padding
                                        >
                                            <div>
                                                <h3 className="text-xs font-medium text-gray-200 truncate">{task.name}</h3> {/* Smaller text */}
                                                <p className="text-xxs text-gray-400 truncate">{task.description}</p> {/* Smaller text */}
                                                <div className="text-xxs text-gray-500 mt-1"> {/* Smaller text */}
                                                    <span>{task.duration} mins</span> {/* Simplified duration display */}
                                                    {/* Removed Due date to save space */}
                                                </div>
                                            </div>
                                         
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                 {/* Time Management Buttons */}
                 <section className="flex justify-around mb-8">
                    <button
                        onClick={generateTimeManagementSchedule}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={isLoadingTasks}
                    >
                        Generate Time-Managed Schedule
                    </button>

                    <button
                        onClick={generateOptimalSchedule}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={isLoadingTasks}
                    >
                        Generate Optimal Schedule
                    </button>
                </section>

                 {/* Generated Schedule Display */}
                {generatedSchedule && (
                    <section className="bg-gray-800 rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-100">Generated Schedule</h2>
                        {generatedSchedule.length > 0 ? (
                            <div className="flex flex-wrap gap-4">
                                {generatedSchedule.map((timeBlock, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-700 rounded-xl p-3 w-48 flex flex-col justify-between hover:bg-gray-600 transition-colors duration-200"
                                    >
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-200 truncate">{timeBlock.taskName}</h3>
                                            <div className="text-xs text-gray-500 mt-1">
                                                <span>Start Time: {timeBlock.startTime}</span>
                                                <span className="ml-2">End Time: {timeBlock.endTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500">No schedule generated.</div>
                        )}
                    </section>
                )}

                {/* Calendar and LLM Interaction Section */}
                <section className="flex lg:flex-row gap-8">
                    {/* Calendar View */}
                    <div className="bg-gray-800 rounded-2xl shadow-lg p-6" style={{ width: '50%', minWidth: '300px' }}>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-100">Calendar</h2>
                        <div className="flex justify-between mb-4">
                            <button
                                onClick={handleSyncCalendar}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                disabled={calendarSyncing}
                            >
                                {calendarSyncing ? 'Syncing...' : 'Sync with Calendar'}
                            </button>
                            <button
                                onClick={handleSmartBreaksClick}
                                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                disabled={smartBreaksMutation.isPending}
                            >
                                {smartBreaksMutation.isPending ? 'Loading...' : 'Get Smart Breaks'}
                            </button>
                        </div>
                        <div style={{ height: '400px', overflow: 'hidden' }}>
                            <TaskCalendar
                                tasks={tasks || []}
                                renderCalendarEvent={renderCalendarEvent} // Use the new render function
                            />
                        </div>
                    </div>

                    {/* LLM Interaction */}
                    <div className="bg-gray-800 rounded-2xl shadow-lg p-6" style={{ width: '50%', minWidth: '300px' }}>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-100">LLM Interaction</h2>
                        <div className="mb-4">
                            <label htmlFor="llmPrompt" className="block text-sm font-bold text-gray-300 mb-2">Enter Prompt:</label>
                            <textarea
                                id="llmPrompt"
                                value={llmPrompt}
                                onChange={(e) => setLlmPrompt(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-gray-300 border-gray-600 focus:border-sky-500"
                                rows={3}
                                placeholder="e.g., What's on my schedule for tomorrow? or Schedule my 'Team Meeting' for tomorrow at 2 PM"
                            />
                        </div>
                        <button
                            onClick={handleLlmInteraction}
                            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            disabled={llmInteractionMutation.isPending}
                        >
                            {llmInteractionMutation.isPending ? 'Processing...' : 'Send to LLM'}
                        </button>

                        {llmResult && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold text-gray-200">LLM Result:</h3>
                                {llmResult.error ? (
                                    <p className="text-red-500">{llmResult.error}</p>
                                ) : (
                                    <>
                                        <p className="text-gray-400">{llmResult.explanation || llmResult.message}</p>
                                        {calendarEvents.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="text-md font-semibold text-gray-200 mb-2">Calendar Events:</h4>
                                                <div className="space-y-2">
                                                    {calendarEvents.map((event, index) => (
                                                        <div key={index} className="bg-gray-700 rounded p-3">
                                                            <h5 className="text-gray-200 font-medium">{event.summary}</h5>
                                                            <p className="text-sm text-gray-400">
                                                                {format(new Date(event.start.dateTime), 'MMM d, yyyy h:mm a')} -
                                                                {format(new Date(event.end.dateTime), 'h:mm a')}
                                                            </p>
                                                            {event.description && (
                                                                <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {llmResult.result && !Array.isArray(llmResult.result) && (
                                            <pre className="bg-gray-700 rounded p-2 text-sm text-gray-300 mt-2">
                                                <code>{JSON.stringify(llmResult.result, null, 2)}</code>
                                            </pre>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Smart Breaks Section */}
            {showSmartBreaks && smartBreaksData && (
                <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-100">Schedule Insights</h2>
                        <button
                            onClick={() => setShowSmartBreaks(false)}
                            className="text-gray-400 hover:text-gray-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Smart Suggestions */}
                        <div className="bg-gray-700 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-200 mb-3">Smart Suggestions</h3>
                            <ul className="space-y-2">
                                {smartBreaksData.suggestions.map((suggestion, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-sky-400 mr-2">•</span>
                                        <span className="text-gray-300">{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Schedule Optimizations */}
                        <div className="bg-gray-700 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-200 mb-3">Schedule Optimizations</h3>
                            <ul className="space-y-2">
                                {smartBreaksData.scheduleOptimizations.map((tip, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-sky-400 mr-2">•</span>
                                        <span className="text-gray-300">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Wellness Tips */}
                        <div className="bg-gray-700 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-200 mb-3">Wellness Tips</h3>
                            <ul className="space-y-2">
                                {smartBreaksData.wellnessTips.map((tip, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-sky-400 mr-2">•</span>
                                        <span className="text-gray-300">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* New Break Events */}
                        {smartBreaksData.breakEvents.length > 0 && (
                            <div className="bg-gray-700 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-200 mb-3">New Break Events</h3>
                                <ul className="space-y-2">
                                    {smartBreaksData.breakEvents.map((event) => (
                                        <li key={event.id} className="flex items-start">
                                            <span className="text-sky-400 mr-2">•</span>
                                            <div>
                                                <span className="font-medium text-gray-200">
                                                    {format(new Date(event.start.dateTime), 'h:mm a')}
                                                </span>
                                                <span className="text-gray-400 ml-2">- {event.description}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskManagement;