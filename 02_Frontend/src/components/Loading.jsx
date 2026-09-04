import React from 'react';

export default function Loading({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      gap: '1rem'
    }}>
      <div className="spinner"></div>
      <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', fontWeight: 500 }}>{message}</p>
    </div>
  );
}
