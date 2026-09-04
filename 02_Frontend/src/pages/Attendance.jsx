import React, { useState, useEffect } from 'react';
import api, { authService } from '../services/api';
import Loading from '../components/Loading';
import { QrCode, CheckCircle, AlertCircle, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Attendance() {
  const user = authService.getAuthUser();
  const isStudent = user?.role === 'STUDENT';
  const isOrganizer = ['FACULTY', 'ADMIN'].includes(user?.role);

  // Student QR submission state
  const [tokenInput, setTokenInput] = useState('');
  const [submittingToken, setSubmittingToken] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);

  // Organizer QR generation state
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [qrData, setQrData] = useState(null);
  const [generatingQr, setGeneratingQr] = useState(false);
  const [qrError, setQrError] = useState('');

  useEffect(() => {
    if (isOrganizer) {
      loadApprovedEvents();
    }
  }, []);

  const loadApprovedEvents = async () => {
    try {
      const res = await api.get('/events?status=APPROVED');
      setEvents(res.data);
      if (res.data.length > 0) {
        setSelectedEventId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStudentScan = async (e) => {
    e.preventDefault();
    setScanMessage(null);

    if (!tokenInput.trim()) {
      setScanMessage({ type: 'danger', text: 'Please enter a valid attendance token.' });
      return;
    }

    try {
      setSubmittingToken(true);
      const res = await api.post('/attendance/scan', { token: tokenInput.trim() });
      setScanMessage({ type: 'success', text: res.data.message || 'Attendance marked successfully!' });
      setTokenInput('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to mark attendance. Ensure you are registered and token is not expired.';
      setScanMessage({ type: 'danger', text: msg });
    } finally {
      setSubmittingToken(false);
    }
  };

  const handleGenerateQr = async () => {
    if (!selectedEventId) return;
    setQrError('');
    try {
      setGeneratingQr(true);
      const res = await api.get(`/attendance/qr/${selectedEventId}`);
      setQrData(res.data);
    } catch (err) {
      setQrError(err.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setGeneratingQr(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>Attendance Management System</h1>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
          Real-time QR verification powered by ZXing and secure single-use time-limited tokens.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isOrganizer && !isStudent ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        {/* Student Verification Portal */}
        {(isStudent || user?.role === 'ADMIN') && (
          <div className="form-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.65rem', borderRadius: '12px' }}>
                <QrCode size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Student Attendance Check-In</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>Enter token or scan projection QR</p>
              </div>
            </div>

            {scanMessage && (
              <div className={`alert alert-${scanMessage.type}`}>
                {scanMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span>{scanMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleStudentScan}>
              <div className="form-group">
                <label className="form-label">Attendance Token (UUID)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value)}
                  required
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.35rem' }}>
                  The token is embedded in the live event QR code shown by the session instructor.
                </p>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
                disabled={submittingToken}
              >
                {submittingToken ? 'Verifying attendance...' : 'Verify Attendance'} <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}

        {/* Organizer / Admin Live QR Projector */}
        {isOrganizer && (
          <div className="form-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.65rem', borderRadius: '12px' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Organizer QR Generator</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>Project high-resolution QR in lecture hall</p>
              </div>
            </div>

            {qrError && (
              <div className="alert alert-danger">
                <AlertCircle size={18} />
                <span>{qrError}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Select Approved Event</label>
              <select
                className="form-control"
                value={selectedEventId}
                onChange={e => setSelectedEventId(e.target.value)}
              >
                {events.length === 0 && <option value="">No approved events found</option>}
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.date} at {ev.startTime?.substring(0, 5)})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateQr}
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '1.5rem' }}
              disabled={generatingQr || !selectedEventId}
            >
              {generatingQr ? 'Generating QR...' : 'Generate 30-Min QR Code'}
            </button>

            {qrData && (
              <div style={{
                background: 'var(--slate-50)',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <h4 style={{ fontWeight: 800, color: 'var(--dark)', marginBottom: '0.5rem' }}>
                  {qrData.eventTitle}
                </h4>
                <div style={{
                  display: 'inline-block',
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--slate-200)',
                  margin: '0.5rem 0'
                }}>
                  <img
                    src={qrData.qrCode}
                    alt="Event QR Code"
                    style={{ width: '280px', height: '280px', display: 'block' }}
                  />
                </div>
                <p style={{ color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 700, marginTop: '0.5rem' }}>
                  Expires at: {new Date(qrData.expiresAt).toLocaleTimeString()} (30 minutes)
                </p>
                <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
                  Token: {qrData.token}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
