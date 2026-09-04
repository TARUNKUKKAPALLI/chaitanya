import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Clock, MapPin, Users, Tag, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    category: 'Technology',
    capacity: 50,
    venueId: ''
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoadingVenues(true);
      const res = await api.get('/venues?availableOnly=true');
      setVenues(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, venueId: res.data[0].id }));
      }
    } catch (err) {
      console.error(err);
      setError('Could not load campus venues.');
    } finally {
      setLoadingVenues(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime || !formData.venueId) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (formData.endTime <= formData.startTime) {
      setError('End time must be after start time.');
      return;
    }

    const selectedVenue = venues.find(v => v.id === parseInt(formData.venueId));
    if (selectedVenue && parseInt(formData.capacity) > selectedVenue.capacity) {
      setError(`Event capacity (${formData.capacity}) cannot exceed selected venue capacity (${selectedVenue.capacity}).`);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        startTime: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
        endTime: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
        category: formData.category,
        capacity: parseInt(formData.capacity),
        venueId: parseInt(formData.venueId)
      };

      await api.post('/events', payload);
      setSuccess('Event created successfully! It is now pending administrative approval.');
      setTimeout(() => {
        navigate('/my-events');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to schedule event. Please check for scheduling conflicts.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.25rem' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="form-card">
        <div style={{ borderBottom: '1px solid var(--slate-200)', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)' }}>Schedule a New Campus Event</h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Fill out event details. The system automatically detects venue time conflicts.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              name="title"
              className="form-control"
              placeholder="e.g., Annual AI Hackathon 2026"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description &amp; Agenda</label>
            <textarea
              name="description"
              className="form-control"
              rows={4}
              placeholder="Provide event details, prerequisites, schedule, and speaker information..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Event Date *</label>
              <input
                type="date"
                name="date"
                className="form-control"
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Technology">Technology &amp; Coding</option>
                <option value="Academics">Academics &amp; Seminars</option>
                <option value="Cultural">Cultural &amp; Arts</option>
                <option value="Sports">Sports &amp; Fitness</option>
                <option value="Workshop">Hands-on Workshops</option>
                <option value="Placement">Career &amp; Placement</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input
                type="time"
                name="startTime"
                className="form-control"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time *</label>
              <input
                type="time"
                name="endTime"
                className="form-control"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Campus Venue *</label>
              <select
                name="venueId"
                className="form-control"
                value={formData.venueId}
                onChange={handleChange}
                disabled={loadingVenues}
                required
              >
                {venues.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.location}) — Max Capacity: {v.capacity}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Participant Capacity *</label>
              <input
                type="number"
                name="capacity"
                className="form-control"
                min={1}
                value={formData.capacity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || loadingVenues}
            >
              {submitting ? 'Verifying schedule...' : 'Schedule Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
