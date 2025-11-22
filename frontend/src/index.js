import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/darkmode.css'; // ✅ IMPORTAR ESTILOS GLOBALES DARK MODE
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext'; // ✅ IMPORTAR CONTEXTO

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <DarkModeProvider> {/* ✅ ENVOLVER APP */}
        <App />
      </DarkModeProvider>
    </AuthProvider>
  </React.StrictMode>
);