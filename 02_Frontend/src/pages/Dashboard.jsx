import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { authService } from '../services/api';
import EventCard from '../components/EventCard';
import Loading from '../components/Loading';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Users, 
  MapPin, 
  Bell, 
  AlertCircle, 
  PlusCircle, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';

export default function Dashboard() {
  const user = authService.getAuthUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      if (user.role === 'ADMIN' || user.role === 'FACULTY') {
        const analyticsRes = await api.get('/analytics/dashboard');
        setStats(analyticsRes.data);
      }

      // Fetch approved events for browse section
      const eventsRes = await api.get('/events?status=APPROVED');
      setRecentEvents(eventsRes.data.slice(0, 6));

      if (user.role === 'STUDENT') {
        const regRes = await api.get('/registrations/my-events');
        setMyRegistrations(regRes.data);
      } else if (user.role === 'ADMIN') {
        const pendingRes = await api.get('/events?status=PENDING');
        setPendingApprovals(pendingRes.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard metrics. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await api.post(`/registrations/event/${eventId}`);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    try {
      await api.delete(`/registrations/event/${eventId}`);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const handleApprove = async (eventId) => {
    try {
      await api.put(`/events/${eventId}/status`, { status: 'APPROVED' });
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (eventId) => {
    try {
      await api.put(`/events/${eventId}/status`, { status: 'REJECTED' });
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  if (loading) return <Loading message="Loading dashboard intelligence..." />;

  return (
    <div>
      {/* Welcome Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem'
      }}>
        <div>
          <span className={`role-badge role-${user.role.toLowerCase()}`} style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
            {user.role.replace('_', ' ')} PORTAL
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Welcome back, {user.name}!
          </h1>
          <p style={{ color: '#c7d2fe', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            {user.role === 'STUDENT' && "Discover upcoming campus activities, register with 1 click, and mark QR attendance."}
            {user.role === 'FACULTY' && "Organize lectures, seminars, track attendance in real-time, and manage venues."}
            {user.role === 'ADMIN' && "Full control over event approvals, venue conflicts, users, and campus-wide analytics."}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {user.role === 'STUDENT' && (
            <>
              <Link to="/attendance" className="btn btn-primary" style={{ background: 'white', color: 'var(--primary)' }}>
                Scan Attendance QR
              </Link>
              <Link to="/events" className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                Browse All Events
              </Link>
            </>
          )}

          {['FACULTY', 'ADMIN'].includes(user.role) && (
            <>
              <Link to="/create-event" className="btn btn-primary" style={{ background: 'white', color: 'var(--primary)' }}>
                <PlusCircle size={16} /> Create New Event
              </Link>
              <Link to="/attendance" className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                Generate Event QR
              </Link>
            </>
          )}

          {user.role === 'ADMIN' && (
            <>
              <Link to="/admin" className="btn btn-primary" style={{ background: 'white', color: 'var(--primary)' }}>
                <ShieldCheck size={16} /> Admin Command Center
              </Link>
              <Link to="/venues" className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                Manage Venues
              </Link>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      {user.role === 'STUDENT' ? (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Calendar size={24} />
            </div>
            <div>
              <div className="stat-val">{recentEvents.length}</div>
              <div className="stat-lbl">Active Approved Events</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="stat-val">{myRegistrations.length}</div>
              <div className="stat-lbl">My Event Registrations</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
              <Award size={24} />
            </div>
            <div>
              <div className="stat-val">{myRegistrations.filter(r => r.attended).length}</div>
              <div className="stat-lbl">Attended Sessions</div>
            </div>
          </div>
        </div>
      ) : (
        stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <Calendar size={24} />
              </div>
              <div>
                <div className="stat-val">{stats.totalEvents}</div>
                <div className="stat-lbl">Total Events</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="stat-val">{stats.approvedEvents}</div>
                <div className="stat-lbl">Approved Events</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                <Clock size={24} />
              </div>
              <div>
                <div className="stat-val">{stats.pendingEvents}</div>
                <div className="stat-lbl">Pending Approvals</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                <Users size={24} />
              </div>
              <div>
                <div className="stat-val">{stats.totalRegistrations}</div>
                <div className="stat-lbl">Registrations</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fce7f3', color: '#be185d' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="stat-val">{stats.totalAttendance}</div>
                <div className="stat-lbl">Verified Attendances</div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Admin Pending Approvals Queue */}
      {user.role === 'ADMIN' && pendingApprovals.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} style={{ color: 'var(--warning)' }} /> Pending Approvals Queue ({pendingApprovals.length})
            </h2>
            <Link to="/admin" className="btn btn-secondary btn-sm">
              Review in Admin Panel <ArrowRight size={14} />
            </Link>
          </div>

          <div className="event-grid">
            {pendingApprovals.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        </div>
      )}

      {/* Featured / Upcoming Events */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)' }}>
              Upcoming Approved Events
            </h2>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem' }}>
              Confirmed campus events ready for attendance
            </p>
          </div>
          <Link to="/events" className="btn btn-secondary btn-sm">
            View All ({recentEvents.length}) <ArrowRight size={14} />
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} className="empty-icon" />
            <h3 className="empty-title">No approved events available</h3>
            <p className="empty-desc">Check back soon or create one if you are a faculty member or coordinator.</p>
          </div>
        ) : (
          <div className="event-grid">
            {recentEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={handleRegister}
                onCancelRegistration={handleCancelRegistration}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
