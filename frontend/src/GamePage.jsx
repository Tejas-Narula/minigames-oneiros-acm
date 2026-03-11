import React from 'react';
import acmLogo from './assets/acm_logo.png';

export default function GamePage({ title, children }) {
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <img
        src={acmLogo}
        alt="ACM Logo"
        style={{
          position: 'fixed',
          top: '12px',
          right: '12px',
          zIndex: 9999,
          width: '48px',
          height: '48px',
          objectFit: 'contain',
          borderRadius: '8px',
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  );
}
