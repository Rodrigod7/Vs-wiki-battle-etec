import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Layout
import MainLayout from './layouts/MainLayout';

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

// Messaging
import MessagingPage from './pages/MessagingPage';

import { useAuth } from './context/AuthContext';

function App() {
  const { isLoggedIn } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Characters */}
          <Route path="/" element={<CharacterGallery />} />
          <Route path="/character/:id" element={<CharacterDetail />} />
          <Route path="/characters/:id" element={<Navigate to="/character/:id" replace />} />

          {/* Battles */}
          <Route path="/battles" element={<BattleGallery />} />
          <Route path="/battle/create" element={<BattleArena />} />
          <Route path="/battle/:id" element={<BattleDetail />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/profile/:userId" element={<UserProfile />} />

          {/* Protected */}
          <Route path="/create-character" element={isLoggedIn ? <CreateCharacter /> : <Navigate to="/login" />} />
          <Route path="/manage-characters" element={isLoggedIn ? <ManageCharacters /> : <Navigate to="/login" />} />
          <Route path="/configure-user" element={isLoggedIn ? <UserProfileConfig /> : <Navigate to="/login" />} />
          <Route path="/messages" element={isLoggedIn ? <MessagingPage /> : <Navigate to="/login" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;