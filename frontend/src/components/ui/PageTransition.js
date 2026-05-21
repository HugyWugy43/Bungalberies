import React from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const location = useLocation();

  return (
    <div key={location.pathname} style={{ animation: 'fadeSlideIn 0.3s ease both' }}>
      {children}
    </div>
  );
}
