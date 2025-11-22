// src/components/Spinner.js
import React from 'react';
import './Spinner.css';

const Spinner = ({ size = 'medium', message = '' }) => {
  return (
    <div className="spinner-container">
      <div className={`spinner spinner-${size}`}></div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export default Spinner;