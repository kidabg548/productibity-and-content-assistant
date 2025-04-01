import { Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  MusicalNoteIcon, 
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-6">
        <div className="flex items-center space-x-2 mb-8">
          <UserCircleIcon className="h-8 w-8 text-indigo-500" />
          <span className="text-xl font-bold">Productivity Assistant</span>
        </div>
        
        <nav className="space-y-2">
          <Link 
            to="/" 
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <HomeIcon className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/music" 
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <MusicalNoteIcon className="h-5 w-5" />
            <span>Music</span>
          </Link>

          <Link 
            to="/task-management" 
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ClipboardDocumentListIcon className="h-5 w-5" />
            <span>Tasks</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors w-full text-left"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default Navbar; 