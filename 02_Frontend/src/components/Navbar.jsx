import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import api, { authService } from '../services/api';
import { 
  Calendar, 
  Home, 
  PlusCircle, 
  Bookmark, 
  MapPin, 
  QrCode, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const user = authService.getAuthUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const unread = res.data.filter(n => !n.readStatus).length;
      setUnreadCount(unread);
    } catch (err) {
      // ignore in background
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) return null;

  const roleClass = `role-${user.role.toLowerCase()}`;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="nav-brand">
          <Calendar size={28} />
          <span>CampusEvent</span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Home size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Calendar size={18} />
            <span>Events</span>
          </NavLink>

          {['FACULTY', 'ADMIN'].includes(user.role) && (
            <NavLink to="/create-event" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <PlusCircle size={18} />
              <span>Create Event</span>
            </NavLink>
          )}

          <NavLink to="/my-events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Bookmark size={18} />
            <span>{user.role === 'STUDENT' ? 'My Registrations' : 'My Events'}</span>
          </NavLink>

          <NavLink to="/attendance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <QrCode size={18} />
            <span>Attendance</span>
          </NavLink>

          <NavLink to="/venues" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <MapPin size={18} />
            <span>Venues</span>
          </NavLink>

          {user.role === 'ADMIN' && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ShieldCheck size={18} />
              <span>Admin</span>
            </NavLink>
          )}

          <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ position: 'relative' }}>
            <Bell size={18} />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                background: 'var(--danger)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 700,
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {unreadCount}
              </span>
            )}
          </NavLink>
        </div>

        {/* User Info & Actions */}
        <div className="nav-user">
          <span className={`role-badge ${roleClass}`}>{user.role.replace('_', ' ')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-800)', fontWeight: 600, fontSize: '0.9rem' }}>
            <UserIcon size={16} />
            <span>{user.name}</span>
          </div>

          <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log out">
            <LogOut size={16} />
            <span style={{ display: 'none' }}>Logout</span>
          </button>

          {/* Mobile hamburger */}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="btn btn-secondary btn-sm" 
            style={{ display: 'none' }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
