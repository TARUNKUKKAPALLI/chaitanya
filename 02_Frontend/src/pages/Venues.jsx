import React, { useState, useEffect } from 'react';
import api, { authService } from '../services/api';
import Loading from '../components/Loading';
import { MapPin, Users, CheckCircle, XCircle, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export default function Venues() {
  const user = authService.getAuthUser();
  const isAdmin = user?.role === 'ADMIN';

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    location: '',
    capacity: 100,
    available: true
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await api.get('/venues');
      setVenues(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load campus venues.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingVenue(null);
    setForm({ name: '', location: '', capacity: 100, available: true });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (venue) => {
    setEditingVenue(venue);
    setForm({
      name: venue.name,
      location: venue.location,
      capacity: venue.capacity,
      available: venue.available
    });
    setError('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) return;
    try {
      await api.delete(`/venues/${id}`);
      fetchVenues();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete venue');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVenue) {
        await api.put(`/venues/${editingVenue.id}`, form);
      } else {
        await api.post('/venues', form);
      }
      setModalOpen(false);
      fetchVenues();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save venue');
    }
  };

  if (loading) return <Loading message="Loading campus venues..." />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark)' }}>Campus Venues &amp; Auditoriums</h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
            Auditoriums, seminar halls, labs, and activity spaces available for scheduling.
          </p>
        </div>

        {isAdmin && (
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={16} /> Add Venue
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {venues.map(v => (
          <div key={v.id} style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--slate-200)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--dark)' }}>{v.name}</h3>
                <span className={`status-pill ${v.available ? 'status-approved' : 'status-rejected'}`}>
                  {v.available ? 'Available' : 'Maintenance'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--slate-600)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} style={{ color: 'var(--primary)' }} />
                  <span>{v.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} style={{ color: 'var(--secondary)' }} />
                  <span>Capacity: <strong>{v.capacity}</strong> attendees</span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button onClick={() => openEditModal(v)} className="btn btn-secondary btn-sm">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(v.id)} className="btn btn-danger btn-sm">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Admin Venue Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                {editingVenue ? 'Edit Campus Venue' : 'Create Campus Venue'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm" style={{ border: 'none' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Venue Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Science Auditorium"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location / Block *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Block C, 3rd Floor"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Seating Capacity *</label>
                    <input
                      type="number"
                      className="form-control"
                      min={1}
                      value={form.capacity}
                      onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Availability Status</label>
                    <select
                      className="form-control"
                      value={form.available ? 'true' : 'false'}
                      onChange={e => setForm({ ...form, available: e.target.value === 'true' })}
                    >
                      <option value="true">Available for Booking</option>
                      <option value="false">Under Maintenance / Reserved</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingVenue ? 'Save Changes' : 'Create Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
