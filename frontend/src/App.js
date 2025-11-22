// frontend/src/App.js
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import CharacterGallery from './components/CharacterGallery';
import CharacterDetail from './components/CharacterDetail';
import CreateCharacter from './components/CreateCharacter';
import ManageCharacters from './components/ManageCharacters';
import VerifyEmail from './components/VerifyEmail';
import Sidebar from './components/Sidebar';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import UserProfileConfig from './components/UserProfileConfig';
import Messaging from './components/Messaging';
import NotificationBell from './components/NotificationBell'; // ✅ NUEVA IMPORTACIÓN

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isLoggedIn } = useAuth();

  return (
    <BrowserRouter>
      <div className={`App ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Toaster position="top-right" reverseOrder={false} />
       
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <header className="App-header">
          <button
              className="menu-toggle-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
              {isSidebarOpen ? '✕' : '☰'}
          </button>
          <h1>⚔️ VS Wiki Battle ETEC</h1>
         
          <div className="nav-buttons">
            <Link to="/" className="btn">Galería</Link>
            
            {/* ✅ AQUÍ AGREGAMOS LA CAMPANA (Solo si está logueado) */}
            {isLoggedIn && <NotificationBell />}
          </div>
        </header>

        <main className="App-main">
          <Routes>
            <Route path="/" element={<CharacterGallery />} />
            <Route path="/characters/:id" element={<CharacterDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            <Route
              path="/create-character"
              element={isLoggedIn ? <CreateCharacter /> : <Navigate to="/login" />}
            />
            <Route
              path="/manage-characters"
              element={isLoggedIn ? <ManageCharacters /> : <Navigate to="/login" />}
            />
            <Route
              path="/configure-user"
              element={isLoggedIn ? <UserProfileConfig /> : <Navigate to="/login" />}
            />
            <Route
              path="/messages"
              element={isLoggedIn ? <Messaging /> : <Navigate to="/login" />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;