import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';
import { Bell, Check, CheckCheck, Clock } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, readStatus: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.readStatus);
    for (const n of unread) {
      try {
        await api.put(`/notifications/${n.id}/read`);
      } catch (e) {}
    }
    setNotifications(notifications.map(n => ({ ...n, readStatus: true })));
  };

  if (loading) return <Loading message="Loading notifications..." />;

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>Your Notifications</h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
            Approvals, event registrations, scheduling updates, and attendance confirmations.
          </p>
        </div>

        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn btn-secondary btn-sm">
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <Bell size={48} className="empty-icon" />
          <h3 className="empty-title">All caught up!</h3>
          <p className="empty-desc">You don't have any notifications right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map(n => (
            <div
              key={n.id}
              style={{
                background: n.readStatus ? 'var(--white)' : '#f5f3ff',
                border: `1px solid ${n.readStatus ? 'var(--slate-200)' : '#c7d2fe'}`,
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                boxShadow: varCssShadow(n.readStatus)
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: n.readStatus ? 'var(--slate-100)' : 'var(--primary-light)',
                  color: n.readStatus ? 'var(--slate-400)' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bell size={18} />
                </div>
                <div>
                  <p style={{ color: 'var(--slate-800)', fontWeight: n.readStatus ? 500 : 700, fontSize: '0.95rem' }}>
                    {n.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--slate-400)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                    <Clock size={13} />
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {!n.readStatus && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="btn btn-secondary btn-sm"
                  title="Mark as read"
                  style={{ flexShrink: 0 }}
                >
                  <Check size={14} /> Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function varCssShadow(read) {
  return read ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : '0 4px 6px -1px rgb(79 70 229 / 0.1)';
}
