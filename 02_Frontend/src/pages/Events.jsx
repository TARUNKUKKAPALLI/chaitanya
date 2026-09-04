import React, { useState, useEffect } from 'react';
import api, { authService } from '../services/api';
import EventCard from '../components/EventCard';
import Loading from '../components/Loading';
import { Search, Filter, Calendar, QrCode, X, Users, CheckCircle, AlertCircle } from 'lucide-react';

export default function Events() {
  const user = authService.getAuthUser();
  const isOrganizerOrAdmin = user && ['FACULTY', 'ADMIN'].includes(user.role);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState(user?.role === 'STUDENT' ? 'APPROVED' : '');

  // Modals state
  const [qrModal, setQrModal] = useState(null);
  const [participantsModal, setParticipantsModal] = useState(null);
  const [participantsList, setParticipantsList] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [category, date, status]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (date) params.append('date', date);
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const res = await api.get(`/events?${params.toString()}`);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleRegister = async (eventId) => {
    try {
      await api.post(`/registrations/event/${eventId}`);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!window.confirm('Cancel your registration for this event?')) return;
    try {
      await api.delete(`/registrations/event/${eventId}`);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const handleApprove = async (eventId) => {
    try {
      await api.put(`/events/${eventId}/status`, { status: 'APPROVED' });
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (eventId) => {
    try {
      await api.put(`/events/${eventId}/status`, { status: 'REJECTED' });
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      await api.delete(`/events/${eventId}`);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Deletion failed');
    }
  };

  const handleShowQr = async (event) => {
    try {
      setLoadingModal(true);
      const res = await api.get(`/attendance/qr/${event.id}`);
      setQrModal(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoadingModal(false);
    }
  };

  const handleViewParticipants = async (event) => {
    try {
      setLoadingModal(true);
      setParticipantsModal(event);
      const res = await api.get(`/registrations/event/${event.id}`);
      setParticipantsList(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch participants');
    } finally {
      setLoadingModal(false);
    }
  };

  const handleToggleAttendance = async (registrationId, currentStatus) => {
    try {
      await api.put(`/registrations/${registrationId}/attendance`, { attended: !currentStatus });
      // Refresh participants
      if (participantsModal) {
        const res = await api.get(`/registrations/event/${participantsModal.id}`);
        setParticipantsList(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update attendance');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>College Events Directory</h1>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
          Explore campus workshops, hackathons, seminars, sports, and cultural festivals.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="filter-bar">
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--slate-400)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search by title, description, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ flex: '1 1 150px' }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Technology">Technology &amp; Hackathons</option>
          <option value="Academics">Academics &amp; Lectures</option>
          <option value="Cultural">Cultural &amp; Arts</option>
          <option value="Sports">Sports &amp; Fitness</option>
          <option value="Workshop">Hands-on Workshops</option>
          <option value="Placement">Placement &amp; Career</option>
        </select>

        <input
          type="date"
          className="form-control"
          style={{ flex: '1 1 140px' }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {isOrganizerOrAdmin && (
          <select
            className="form-control"
            style={{ flex: '1 1 140px' }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
        )}

        <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
          <Filter size={16} /> Filter
        </button>

        {(search || category || date || status) && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSearch('');
              setCategory('');
              setDate('');
              setStatus(user?.role === 'STUDENT' ? 'APPROVED' : '');
            }}
          >
            Reset
          </button>
        )}
      </form>

      {/* Events Grid */}
      {loading ? (
        <Loading message="Fetching events..." />
      ) : events.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} className="empty-icon" />
          <h3 className="empty-title">No matching events found</h3>
          <p className="empty-desc">Try tweaking your search filters or check back later for newly announced campus events.</p>
        </div>
      ) : (
        <div className="event-grid">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={handleRegister}
              onCancelRegistration={handleCancelRegistration}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDelete}
              onShowQr={handleShowQr}
              onViewParticipants={handleViewParticipants}
            />
          ))}
        </div>
      )}

      {/* Live QR Code Modal */}
      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Attendance QR Code</h3>
              <button onClick={() => setQrModal(null)} className="btn btn-secondary btn-sm" style={{ border: 'none' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <p style={{ fontWeight: 700, color: 'var(--dark)' }}>{qrModal.eventTitle}</p>
              
              <div style={{
                background: 'white',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--slate-200)'
              }}>
                <img src={qrModal.qrCode} alt="Attendance QR Code" style={{ width: '260px', height: '260px', display: 'block' }} />
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                <p>Project this QR in the lecture hall or seminar venue.</p>
                <p style={{ color: 'var(--danger)', fontWeight: 600, marginTop: '0.25rem' }}>
                  Valid for 30 minutes (Expires: {new Date(qrModal.expiresAt).toLocaleTimeString()})
                </p>
                <p style={{ marginTop: '0.5rem', fontFamily: 'monospace', background: 'var(--slate-100)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                  Token: {qrModal.token}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setQrModal(null)} className="btn btn-primary" style={{ width: '100%' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participants Modal */}
      {participantsModal && (
        <div className="modal-overlay" onClick={() => setParticipantsModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Participants List</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--slate-600)' }}>{participantsModal.title}</p>
              </div>
              <button onClick={() => setParticipantsModal(null)} className="btn btn-secondary btn-sm" style={{ border: 'none' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {participantsList.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '2rem' }}>No registrations yet.</p>
              ) : (
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Registered On</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantsList.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.studentName}</td>
                        <td>{p.studentEmail}</td>
                        <td>{new Date(p.registrationDate).toLocaleDateString()}</td>
                        <td>
                          {p.attended ? (
                            <span className="status-pill status-approved">
                              <CheckCircle size={12} /> Attended
                            </span>
                          ) : (
                            <span className="status-pill status-pending">
                              Absent
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleAttendance(p.id, p.attended)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                          >
                            Toggle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setParticipantsModal(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
