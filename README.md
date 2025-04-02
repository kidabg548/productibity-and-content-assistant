# Productivity and Content Assistant

A full-stack application that helps users manage tasks, schedule events, and generate content using AI-powered features. The application integrates with Google Calendar and provides a seamless experience for task management and content creation.

## Features

### Task Management
- Create, update, and delete tasks
- Set task duration, complexity, and due dates
- AI-powered task scheduling
- Visual calendar integration
- Task prioritization

### Calendar Integration
- Google Calendar integration
- View and manage calendar events
- Natural language scheduling
- AI-powered schedule generation
- Event conflict detection

### Authentication
- Google OAuth integration
- Secure JWT-based authentication
- Protected routes and endpoints
- User session management

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- React Query for data fetching
- React Router for navigation
- Shadcn UI components

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Google Calendar API
- OpenAI API integration
- Function calling for LLM interactions

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google Cloud Platform account (for OAuth and Calendar API)
- OpenAI API key

## Environment Variables

### Backend (.env)
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OPENAI_API_KEY=your_openai_api_key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/kidabg548/productivity-and-content-assistant.git
cd productivity-and-content-assistant
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend server:
```bash
cd frontend
npm run dev
```
