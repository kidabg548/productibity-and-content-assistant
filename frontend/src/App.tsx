import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {  AnimatePresence } from 'framer-motion';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SpotifyCallback from './pages/auth/SpotifyCallback';
import MusicRecommendation from './pages/MusicRecommendation';
import Dashboard from './pages/Dashboard';
import TaskManagement from './pages/TaskManagement';


// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <AnimatePresence mode="wait">
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/spotify/callback" element={<SpotifyCallback />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Navbar />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/music" element={<MusicRecommendation />} />
                  <Route path="/task-management" element={<TaskManagement />} />
                </Route>
              </Route>
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
