import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/darkmode.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { SocketProvider } from './context/SocketContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <DarkModeProvider>
          <App />
        </DarkModeProvider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);