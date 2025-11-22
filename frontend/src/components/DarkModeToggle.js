// frontend/src/components/DarkModeToggle.js
import React from 'react';
import { useDarkMode } from '../context/DarkModeContext';
import './DarkModeToggle.css';

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <button onClick={toggleDarkMode} className="dark-mode-toggle" title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}>
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
};

export default DarkModeToggle;
