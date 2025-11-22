// frontend/src/components/VerifyEmail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner'; // Reutilizamos tu spinner existente

const VerifyEmail = () => {
  const { token } = useParams(); // Capturamos el token de la URL
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('verifying'); // Estados: verifying, success, error

  // URL de tu backend (Asegúrate que coincida con tu .env del frontend)
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        // Llamamos al backend para validar el token
        const res = await fetch(`${API_URL}/auth/verify-email/${token}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setStatus('success');
          toast.success('¡Cuenta verificada! Bienvenido guerrero.');
          
          // Iniciamos sesión automáticamente con los datos que devuelve el backend
          login(data.data.user, data.data.token);
          
          // Redirigimos al home después de 2 segundos
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setStatus('error');
          toast.error(data.message || 'El enlace no es válido o ha expirado.');
        }
      } catch (error) {
        console.error(error);
        setStatus('error');
        toast.error('Error de conexión con el servidor.');
      }
    };

    verifyAccount();
  }, [token, navigate, login, API_URL]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === 'verifying' && (
          <>
            <Spinner size="large" />
            <h2 style={styles.title}>Verificando tu cuenta...</h2>
            <p>Por favor espera un momento.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '4rem' }}>✅</div>
            <h2 style={{ ...styles.title, color: '#2ecc71' }}>¡Verificación Exitosa!</h2>
            <p>Ya eres parte de la batalla. Te estamos redirigiendo...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '4rem' }}>❌</div>
            <h2 style={{ ...styles.title, color: '#e74c3c' }}>Error de Verificación</h2>
            <p>El enlace es inválido o ya fue utilizado.</p>
            <button 
              onClick={() => navigate('/login')} 
              className="btn btn-primary"
              style={{ marginTop: '20px' }}
            >
              Ir al Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Estilos simples en línea para este componente
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '20px',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px'
  },
  title: {
    margin: '10px 0',
    fontSize: '1.8em',
    color: '#2c3e50'
  }
};

export default VerifyEmail;