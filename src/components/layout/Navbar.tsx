import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  MessageCircle,
  User,
  LogOut,
  Building2,
  CircleDollarSign
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardRoute =
    user?.role === 'entrepreneur'
      ? '/dashboard/entrepreneur'
      : '/dashboard/investor';

  const profileRoute = user
    ? `/profile/${user.role}/${user.id}`
    : '/login';

  const navLinks = [
    {
      icon:
        user?.role === 'entrepreneur' ? (
          <Building2 size={18} />
        ) : (
          <CircleDollarSign size={18} />
        ),
      text: 'Dashboard',
      path: dashboardRoute,
    },
    {
      icon: <MessageCircle size={18} />,
      text: 'Messages',
      path: user ? '/messages' : '/login',
    },
    {
      icon: <Bell size={18} />,
      text: 'Notifications',
      path: user ? '/notifications' : '/login',
    },
    {
      icon: <User size={18} />,
      text: 'Profile',
      path: profileRoute,
    },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                Business Nexus
              </span>
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">

            {user ? (
              <>
                {navLinks.map((link, i) => (
                  <Link
                    key={i}
                    to={link.path}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-primary-600"
                  >
                    <span className="mr-2">{link.icon}</span>
                    {link.text}
                  </Link>
                ))}

                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  leftIcon={<LogOut size={18} />}
                >
                  Logout
                </Button>

                {/* USER PROFILE FIXED AVATAR */}
                <Link to={profileRoute} className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">

                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-gray-700">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>

                  <span className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="p-3 space-y-2">

            {user ? (
              <>
                {navLinks.map((link, i) => (
                  <Link
                    key={i}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-gray-700"
                  >
                    {link.text}
                  </Link>
                ))}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left py-2 text-red-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}

          </div>
        </div>
      )}
    </nav>
  );
};