import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';

// Auth & User
import Register from './components/Register';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import UserProfileConfig from './components/UserProfileConfig';
import VerifyEmail from './components/VerifyEmail';

// Characters
import CharacterGallery from './components/CharacterGallery';
import CharacterDetail from './components/CharacterDetail';
import CreateCharacter from './components/CreateCharacter';
import ManageCharacters from './components/ManageCharacters';

// Battles
import BattleGallery from './components/BattleGallery';
import BattleArena from './components/BattleArena';
import BattleDetail from './components/BattleDetail';

// Core & UI
import Sidebar from './components/Sidebar';
import Messaging from './components/Messaging';
import NotificationBell from './components/NotificationBell';
import DarkModeToggle from './components/DarkModeToggle'; // ✅ NUEVO
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
                className="menu-toggle-btn"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{ position: 'static', transform: 'none' }} // Ajuste pequeño de estilo
            >
                {isSidebarOpen ? '✕' : '☰'}
            </button>
            <h1>⚔️ VS Wiki Battle</h1>
          </div>
         
          <div className="nav-buttons">
            <Link to="/" className="btn">Personajes</Link>
            <Link to="/battles" className="btn btn-warning">🔥 Batallas</Link> {/* ✅ NUEVO BOTÓN */}
            
            <DarkModeToggle /> {/* ✅ TOGGLE MODO OSCURO */}
            
            {isLoggedIn && <NotificationBell />}
          </div>
        </header>

        <main className="App-main">
          <Routes>
            {/* Personajes */}
            <Route path="/" element={<CharacterGallery />} />
            <Route path="/character/:id" element={<CharacterDetail />} /> {/* Ojo: ajusté la ruta a singular */}
            <Route path="/characters/:id" element={<Navigate to={`/character/:id`} replace />} /> {/* Redirección compatibilidad */}

            {/* Batallas (NUEVAS RUTAS) */}
            <Route path="/battles" element={<BattleGallery />} />
            <Route path="/battle/create" element={<BattleArena />} />
            <Route path="/battle/:id" element={<BattleDetail />} />

            {/* Usuarios */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/profile/:userId" element={<UserProfile />} /> {/* ✅ PERFIL PÚBLICO */}

            {/* Rutas Protegidas */}
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