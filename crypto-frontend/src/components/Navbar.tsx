import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LineChart, LogOut, Star } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🚀</span>
            Crypto Tracker
          </Link>

          {isAuthenticated && (
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-6">
                <NavLink 
                  to="/panel" 
                  label="Panel" 
                  icon={<LineChart size={18} />}
                  activePath={location.pathname} 
                />
                <NavLink 
                  to="/favorites" 
                  label="Favoritos" 
                  icon={<Star size={18} />}
                  activePath={location.pathname} 
                />
              </div>
              
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const NavLink: React.FC<{ 
  to: string; 
  label: string; 
  icon: React.ReactNode;
  activePath: string;
}> = ({ 
  to, 
  label, 
  icon,
  activePath 
}) => {
  const isActive = activePath === to;
  
  return (
    <Link
      to={to}
      className={`
        group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
        ${isActive 
          ? 'text-blue-600 bg-blue-50' 
          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
        }
      `}
    >
      <span className={`
        transition-colors duration-200
        ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}
      `}>
        {icon}
      </span>
      {label}
    </Link>
  );
};

export default Navbar;