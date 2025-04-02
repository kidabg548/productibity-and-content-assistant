import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/use-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {  AnimatePresence } from 'framer-motion';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SpotifyCallback from './pages/auth/SpotifyCallback';
import MusicRecommendation from './pages/MusicRecommendation';
import Dashboard from './pages/Dashboard';
import TaskManagement from './pages/TaskManagement';
import GoogleCallback from './pages/GoogleCallback';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <AnimatePresence mode="wait">
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/spotify/callback" element={<SpotifyCallback />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<Navbar />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/music" element={<MusicRecommendation />} />
                    <Route path="/task-management" element={<TaskManagement />} />
                  </Route>
                </Route>

                {/* Redirect to login if not authenticated */}
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
            </AnimatePresence>
          </div>
        </Router>
      </QueryClientProvider>
    </ToastProvider>
  );
};

export default App;
