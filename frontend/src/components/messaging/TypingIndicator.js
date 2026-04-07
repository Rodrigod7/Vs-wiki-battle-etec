// src/components/messaging/TypingIndicator.js
import React from 'react';

const TypingIndicator = ({ username }) => {
  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <span className="typing-text">{username} está escribiendo...</span>
    </div>
  );
};

export default TypingIndicator;
