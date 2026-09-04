import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { authService } from '../services/api';
import EventCard from '../components/EventCard';
import Loading from '../components/Loading';
import { Calendar, CheckCircle, Clock, MapPin, QrCode, Users, X, AlertCircle } from 'lucide-react';

export default function MyEvents() {
  const user = authService.getAuthUser();
  const isStudent = user?.role === 'STUDENT';

  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [organizedEvents, setOrganizedEvents] = useState([]);

  // Modals
  const [qrModal, setQrModal] = useState(null);
  const [participantsModal, setParticipantsModal] = useState(null);
  const [participantsList, setParticipantsList] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      if (isStudent) {
        const res = await api.get('/registrations/my-events');
        setRegistrations(res.data);
      } else {
        // Faculty / Coordinator / Admin
        const res = await api.get('/events');
        const myCreated = res.data.filter(e => e.organizerId === user.id);
        setOrganizedEvents(myCreated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    try {
      await api.delete(`/registrations/event/${eventId}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${eventId}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleShowQr = async (event) => {
    try {
      const res = await api.get(`/attendance/qr/${event.id}`);
      setQrModal(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate QR');
    }
  };

  const handleViewParticipants = async (event) => {
    try {
      setParticipantsModal(event);
      const res = await api.get(`/registrations/event/${event.id}`);
      setParticipantsList(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load participants');
    }
  };

  const handleToggleAttendance = async (registrationId, currentStatus) => {
    try {
      await api.put(`/registrations/${registrationId}/attendance`, { attended: !currentStatus });
      if (participantsModal) {
        const res = await api.get(`/registrations/event/${participantsModal.id}`);
        setParticipantsList(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update attendance');
    }
  };

  if (loading) return <Loading message="Loading your events..." />;

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>
            {isStudent ? 'My Event Registrations' : 'My Organized Events'}
          </h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
            {isStudent
              ? 'View all events you are enrolled in, monitor attendance status, or cancel bookings.'
              : 'Manage schedules, view registered attendee lists, and launch real-time QR attendance.'}
          </p>
        </div>

        {!isStudent && (
          <Link to="/create-event" className="btn btn-primary">
            + Create New Event
          </Link>
        )}
      </div>

      {isStudent ? (
        registrations.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} className="empty-icon" />
            <h3 className="empty-title">No event registrations found</h3>
            <p className="empty-desc">You haven't registered for any events yet. Check out the campus event directory.</p>
            <Link to="/events" className="btn btn-primary">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Category</th>
                  <th>Date &amp; Time</th>
                  <th>Venue</th>
                  <th>Registered On</th>
                  <th>Attendance Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => (
                  <tr key={reg.id}>
                    <td style={{ fontWeight: 700, color: 'var(--dark)' }}>{reg.eventTitle}</td>
                    <td><span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{reg.eventCategory}</span></td>
                    <td>
                      <div>{reg.eventDate}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
                        {reg.eventStartTime?.substring(0, 5)} - {reg.eventEndTime?.substring(0, 5)}
                      </div>
                    </td>
                    <td>{reg.eventVenueName || 'Campus Venue'}</td>
                    <td>{new Date(reg.registrationDate).toLocaleDateString()}</td>
                    <td>
                      {reg.attended ? (
                        <span className="status-pill status-approved">
                          <CheckCircle size={12} /> Present
                        </span>
                      ) : (
                        <span className="status-pill status-pending">
                          Registered
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleCancelRegistration(reg.eventId)}
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: '0.8rem' }}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        organizedEvents.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} className="empty-icon" />
            <h3 className="empty-title">You have not scheduled any events yet</h3>
            <p className="empty-desc">Create seminars, workshops, hackathons, or student activities for the college.</p>
            <Link to="/create-event" className="btn btn-primary">
              Create an Event
            </Link>
          </div>
        ) : (
          <div className="event-grid">
            {organizedEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onDelete={handleDeleteEvent}
                onShowQr={handleShowQr}
                onViewParticipants={handleViewParticipants}
              />
            ))}
          </div>
        )
      )}

      {/* QR Code Modal */}
      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Live Attendance QR</h3>
              <button onClick={() => setQrModal(null)} className="btn btn-secondary btn-sm" style={{ border: 'none' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontWeight: 700, marginBottom: '1rem' }}>{qrModal.eventTitle}</p>
              <img src={qrModal.qrCode} alt="QR Code" style={{ width: '250px', height: '250px', margin: '0 auto', display: 'block', border: '1px solid var(--slate-200)', borderRadius: '8px' }} />
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600, marginTop: '1rem' }}>
                Valid for 30 minutes (Expires: {new Date(qrModal.expiresAt).toLocaleTimeString()})
              </p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontFamily: 'monospace', background: 'var(--slate-100)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                Token: {qrModal.token}
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setQrModal(null)} className="btn btn-primary" style={{ width: '100%' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participants Modal */}
      {participantsModal && (
        <div className="modal-overlay" onClick={() => setParticipantsModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Attendees List</h3>
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
                      <th>Attendance</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantsList.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.studentName}</td>
                        <td>{p.studentEmail}</td>
                        <td>{new Date(p.registrationDate).toLocaleDateString()}</td>
                        <td>
                          {p.attended ? (
                            <span className="status-pill status-approved"><CheckCircle size={12} /> Present</span>
                          ) : (
                            <span className="status-pill status-pending">Absent</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleAttendance(p.id, p.attended)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem' }}
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
