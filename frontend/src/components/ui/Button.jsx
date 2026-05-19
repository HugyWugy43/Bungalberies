import React from 'react';
import './Button.css';

export default function Button({ children, onClick, type = 'button', disabled = false, className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`app-button ${className} ${disabled ? 'disabled' : ''}`}
    >
      {children}
    </button>
  );
}
