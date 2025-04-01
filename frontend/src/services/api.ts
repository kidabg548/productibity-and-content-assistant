import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const register = async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
};

export const initiateGoogleAuth = async () => {
    const response = await api.get('/auth/google-auth');
    return response.data;
};

export const refreshGoogleToken = async () => {
    const response = await api.post('/auth/refresh-token');
    return response.data;
};

export const getTasks = async () => {
    const response = await api.get('/tasks');
    return response.data;
};

export const createTask = async (task: any) => {
    const response = await api.post('/tasks', task);
    return response.data;
};

export const updateTask = async (id: string, task: any) => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
};

export const deleteTask = async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
};

export const generateSchedule = async (tasks: any[]) => {
    const response = await api.post('/time-management/generate-schedule', { tasks });
    return response.data;
};

export const getCalendarEvents = async (startDate: string, endDate: string) => {
    const response = await api.get('/calendar/events', {
        params: { startDate, endDate }
    });
    return response.data;
};

export const syncCalendar = async () => {
    const response = await api.post('/calendar/sync');
    return response.data;
};

export const updateCalendarEvent = async (eventId: string, updates: any) => {
    const response = await api.patch(`/calendar/events/${eventId}`, updates);
    return response.data;
};

export const deleteCalendarEvent = async (eventId: string) => {
    const response = await api.delete(`/calendar/events/${eventId}`);
    return response.data;
}; 