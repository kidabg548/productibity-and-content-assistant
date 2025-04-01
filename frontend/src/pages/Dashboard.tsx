import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MusicalNoteIcon, 
  ClockIcon, 
  ChartBarIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';
import useAuth from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
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
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-4">
          Welcome back, {user?.firstName} {user?.lastName}!
        </h1>
        <p className="text-gray-400 text-lg">
          Enhance your productivity with AI-powered tools and personalized recommendations
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={feature.link}
              className="block p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.name}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 