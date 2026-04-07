// src/layouts/MainLayout.js
import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import DarkModeToggle from '../components/DarkModeToggle';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isLoggedIn } = useAuth();

  return (
    <div className={`App ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Toaster position="top-right" reverseOrder={false} />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <header className="App-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            className="menu-toggle-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ position: 'static', transform: 'none' }}
          >
            {isSidebarOpen ? '✕' : '☰'}
          </button>
          <h1>⚔️ VS Wiki Battle</h1>
        </div>

        <div className="nav-buttons">
          <Link to="/" className="btn">Personajes</Link>
          <Link to="/battles" className="btn btn-warning">🔥 Batallas</Link>
          <DarkModeToggle />
          {isLoggedIn && <NotificationBell />}
        </div>
      </header>

      <main className="App-main">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
