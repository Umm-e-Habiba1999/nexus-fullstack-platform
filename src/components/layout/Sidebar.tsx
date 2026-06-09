import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Building2,
  CircleDollarSign,
  Users,
  MessageCircle,
  Bell,
  FileText,
  Settings,
  HelpCircle,
  Video,
  Calendar,
  Shield,
  CreditCard,
  Upload,
  Menu,
  X,
  Bot,
} from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  collapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  to,
  icon,
  text,
  collapsed,
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center py-2.5 px-4 rounded-md transition-all duration-200 ${
          isActive
            ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      {!collapsed && <span className="text-sm font-medium">{text}</span>}
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  // ENTREPRENEUR MENU
  const entrepreneurItems = [
    { to: '/dashboard/entrepreneur', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/profile/entrepreneur/' + user.id, icon: <Building2 size={20} />, text: 'My Startup' },
    { to: '/investors', icon: <CircleDollarSign size={20} />, text: 'Find Investors' },

    // ⭐ ADVANCED FEATURES
    { to: '/meetings', icon: <Calendar size={20} />, text: 'Meeting Scheduler' },
    { to: '/video-call', icon: <Video size={20} />, text: 'Video Calls' },
    { to: '/documents', icon: <Upload size={20} />, text: 'Document Chamber' },
    { to: '/ai-tools', icon: <Bot size={20} />, text: 'AI Assistant' },

    { to: '/messages', icon: <MessageCircle size={20} />, text: 'Messages' },
    { to: '/notifications', icon: <Bell size={20} />, text: 'Notifications' },
  ];

  // INVESTOR MENU
  const investorItems = [
    { to: '/dashboard/investor', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/profile/investor/' + user.id, icon: <CircleDollarSign size={20} />, text: 'My Portfolio' },
    { to: '/entrepreneurs', icon: <Users size={20} />, text: 'Find Startups' },

    // ⭐ ADVANCED FEATURES
    { to: '/meetings', icon: <Calendar size={20} />, text: 'Meeting Scheduler' },
    { to: '/video-call', icon: <Video size={20} />, text: 'Video Calls' },
    { to: '/payments', icon: <CreditCard size={20} />, text: 'Payments' },
    { to: '/security', icon: <Shield size={20} />, text: 'Security' },

    { to: '/messages', icon: <MessageCircle size={20} />, text: 'Messages' },
    { to: '/notifications', icon: <Bell size={20} />, text: 'Notifications' },
  ];

  const sidebarItems =
    user.role === 'entrepreneur' ? entrepreneurItems : investorItems;

  const commonItems = [
    { to: '/settings', icon: <Settings size={20} />, text: 'Settings' },
    { to: '/help', icon: <HelpCircle size={20} />, text: 'Help & Support' },
  ];

  return (
    <div
      className={`bg-white h-full border-r flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <h1 className="text-lg font-bold text-primary-600">Nexus</h1>
        )}

        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {sidebarItems.map((item, index) => (
            <SidebarItem
              key={index}
              to={item.to}
              icon={item.icon}
              text={item.text}
              collapsed={collapsed}
            />
          ))}
        </div>

        {/* QUICK ACTIONS */}
        {!collapsed && (
          <div className="mt-6 px-3">
            <h3 className="text-xs text-gray-500 uppercase">Quick Actions</h3>

            <button className="w-full mt-2 bg-primary-600 text-white py-2 rounded-md text-sm">
              + New Project
            </button>

            <button className="w-full mt-2 border py-2 rounded-md text-sm">
              Schedule Meeting
            </button>
          </div>
        )}

        {/* COMMON */}
        <div className="mt-8 px-3 space-y-1">
          {commonItems.map((item, index) => (
            <SidebarItem
              key={index}
              to={item.to}
              icon={item.icon}
              text={item.text}
              collapsed={collapsed}
            />
          ))}
        </div>
      </div>

      {/* USER PROFILE */}
      <div className="p-4 border-t flex items-center gap-3">
        <img
          src="https://i.pravatar.cc/40"
          className="w-10 h-10 rounded-full"
        />

        {!collapsed && (
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        )}
      </div>
    </div>
  );
};