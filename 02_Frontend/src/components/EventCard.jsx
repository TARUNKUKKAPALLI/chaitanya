import React from 'react';
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle, Tag, User } from 'lucide-react';
import { authService } from '../services/api';

export default function EventCard({ 
  event, 
  onRegister, 
  onCancelRegistration, 
  onApprove, 
  onReject, 
  onDelete, 
  onEdit, 
  onShowQr, 
  onViewParticipants 
}) {
  const user = authService.getAuthUser();
  const isStudent = user?.role === 'STUDENT';
  const isAdmin = user?.role === 'ADMIN';
  const isOrganizer = user && event.organizerId === user.id;

  const isApproved = event.status === 'APPROVED';
  const isPending = event.status === 'PENDING';
  const isRejected = event.status === 'REJECTED';

  const statusClass = `status-${event.status?.toLowerCase()}`;

  return (
    <div className="event-card">
      <div className="event-card-header">
        <span className="badge" style={{
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '0.2rem 0.6rem',
          borderRadius: '4px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}>
          <Tag size={12} /> {event.category}
        </span>
        <span className={`status-pill ${statusClass}`}>
          {event.status}
        </span>
      </div>

      <div className="event-card-body">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-desc">{event.description || 'No description provided.'}</p>

        <div className="event-meta">
          <div className="meta-row">
            <Calendar size={15} style={{ color: 'var(--primary)' }} />
            <span>{event.date}</span>
          </div>
          <div className="meta-row">
            <Clock size={15} style={{ color: 'var(--secondary)' }} />
            <span>{event.startTime?.substring(0, 5)} - {event.endTime?.substring(0, 5)}</span>
          </div>
          <div className="meta-row">
            <MapPin size={15} style={{ color: 'var(--danger)' }} />
            <span>{event.venue?.name} ({event.venue?.location})</span>
          </div>
          <div className="meta-row">
            <Users size={15} style={{ color: 'var(--warning)' }} />
            <span>{event.registrationCount || 0} / {event.capacity} seats filled ({event.remainingSeats ?? (event.capacity - (event.registrationCount || 0))} left)</span>
          </div>
          <div className="meta-row" style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
            <User size={13} />
            <span>Organizer: {event.organizerName || 'Staff'}</span>
          </div>
        </div>
      </div>

      <div className="event-card-footer">
        {/* Student Controls */}
        {isStudent && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {event.isUserRegistered ? (
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <span className="btn btn-sm" style={{ background: '#dcfce7', color: '#166534', flex: 1, cursor: 'default' }}>
                  <CheckCircle size={14} /> Registered {event.isAttended ? '(Attended)' : ''}
                </span>
                {onCancelRegistration && (
                  <button 
                    onClick={() => onCancelRegistration(event.id)} 
                    className="btn btn-secondary btn-sm"
                    title="Cancel Registration"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ) : isApproved ? (
              (event.remainingSeats > 0 || event.registrationCount < event.capacity) ? (
                <button 
                  onClick={() => onRegister(event.id)} 
                  className="btn btn-primary btn-sm" 
                  style={{ width: '100%' }}
                >
                  Register Now
                </button>
              ) : (
                <button className="btn btn-secondary btn-sm" disabled style={{ width: '100%', opacity: 0.6 }}>
                  Event Full
                </button>
              )
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>
                Pending Admin Approval
              </span>
            )}
          </div>
        )}

        {/* Organizer / Admin Actions */}
        {(isOrganizer || isAdmin) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', width: '100%', justifyContent: 'flex-end' }}>
            {isApproved && onShowQr && (
              <button onClick={() => onShowQr(event)} className="btn btn-secondary btn-sm" title="Show QR Code">
                QR Attendance
              </button>
            )}

            {onViewParticipants && (
              <button onClick={() => onViewParticipants(event)} className="btn btn-secondary btn-sm" title="View Participants">
                Participants ({event.registrationCount || 0})
              </button>
            )}

            {isAdmin && isPending && (
              <>
                <button onClick={() => onApprove(event.id)} className="btn btn-success btn-sm">
                  Approve
                </button>
                <button onClick={() => onReject(event.id)} className="btn btn-danger btn-sm">
                  Reject
                </button>
              </>
            )}

            {onEdit && (
              <button onClick={() => onEdit(event)} className="btn btn-secondary btn-sm">
                Edit
              </button>
            )}

            {onDelete && (
              <button onClick={() => onDelete(event.id)} className="btn btn-danger btn-sm">
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
