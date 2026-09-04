import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';
import EventCard from '../components/EventCard';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('approvals');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      const [analyticsRes, pendingRes, usersRes, eventsRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/events?status=PENDING'),
        api.get('/admin/users'),
        api.get('/events')
      ]);

      setStats(analyticsRes.data);
      setPendingEvents(pendingRes.data);
      setUsersList(usersRes.data);
      setAllEvents(eventsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load administration data.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/events/${id}/status`, { status: 'APPROVED' });
      loadAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/events/${id}/status`, { status: 'REJECTED' });
      loadAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      loadAllAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) return <Loading message="Loading administrative data..." />;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.6rem', borderRadius: '12px' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>Admin Command Center</h1>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
              System-wide oversight, event approvals, user management, and venue controls.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Global Analytics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="stat-val">{stats.totalUsers}</div>
              <div className="stat-lbl">Registered Users</div>
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
            <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="stat-val">{stats.approvedEvents}</div>
              <div className="stat-lbl">Approved Events</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fce7f3', color: '#be185d' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="stat-val">{stats.totalRegistrations}</div>
              <div className="stat-lbl">Total Registrations</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--slate-200)', marginBottom: '1.75rem' }}>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`btn ${activeTab === 'approvals' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <Clock size={16} /> Approvals Queue ({pendingEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <Users size={16} /> User Management ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('allEvents')}
          className={`btn ${activeTab === 'allEvents' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <Calendar size={16} /> All Scheduled Events ({allEvents.length})
        </button>
      </div>

      {/* Tab 1: Approvals Queue */}
      {activeTab === 'approvals' && (
        <div>
          {pendingEvents.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={48} className="empty-icon" style={{ color: 'var(--success)' }} />
              <h3 className="empty-title">Zero Pending Approvals</h3>
              <p className="empty-desc">All submitted events have been reviewed and decided upon.</p>
            </div>
          ) : (
            <div className="event-grid">
              {pendingEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: User Management Table */}
      {activeTab === 'users' && (
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td style={{ fontWeight: 700 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge role-${u.role?.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: All Events Directory */}
      {activeTab === 'allEvents' && (
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Organizer</th>
                <th>Date &amp; Time</th>
                <th>Venue</th>
                <th>Capacity / Regs</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allEvents.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 700 }}>{e.title}</td>
                  <td>{e.category}</td>
                  <td>{e.organizerName}</td>
                  <td>
                    <div>{e.date}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      {e.startTime?.substring(0, 5)} - {e.endTime?.substring(0, 5)}
                    </div>
                  </td>
                  <td>{e.venue?.name}</td>
                  <td>{e.registrationCount || 0} / {e.capacity}</td>
                  <td>
                    <span className={`status-pill status-${e.status?.toLowerCase()}`}>
                      {e.status}
                    </span>
                  </td>
                  <td>
                    {e.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button onClick={() => handleApprove(e.id)} className="btn btn-success btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>Approve</button>
                        <button onClick={() => handleReject(e.id)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>Reject</button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Finalized</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
