import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api, { authService } from '../services/api';
import { Calendar, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isExpired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      authService.setAuth(res.data);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.status === 401
        ? 'Invalid credentials.'
        : err.response?.data?.message || 'Login failed. Please verify your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)',
      padding: '1.5rem'
    }}>
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        maxWidth: '440px',
        width: '100%',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '2.5rem 2rem 1.5rem', textAlign: 'center' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <Calendar size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark)' }}>CampusEvent Pro</h2>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            College Event Management &amp; Scheduling System
          </p>
        </div>

        <div style={{ padding: '0 2rem 2.5rem' }}>
          {isExpired && (
            <div className="alert alert-info">
              <AlertCircle size={18} />
              <span>Your session expired. Please log in again.</span>
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--slate-400)' }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--slate-400)' }} />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div style={{ marginTop: '1.75rem', padding: '1rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Quick Fill Demo Accounts:
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                onClick={() => fillDemo('admin440@gmail.com', '1234567')}
                className="btn btn-secondary btn-sm" 
                style={{ fontSize: '0.75rem' }}
              >
                Admin
              </button>
              <button 
                type="button" 
                onClick={() => fillDemo('faculty@college.edu', 'Faculty@123')}
                className="btn btn-secondary btn-sm" 
                style={{ fontSize: '0.75rem' }}
              >
                Faculty
              </button>
              <button 
                type="button" 
                onClick={() => fillDemo('student@college.edu', 'Student@123')}
                className="btn btn-secondary btn-sm" 
                style={{ fontSize: '0.75rem' }}
              >
                Student
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
