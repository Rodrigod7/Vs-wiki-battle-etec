import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Forms.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
 
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showResend, setShowResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('📧 Correo de verificación reenviado. Revisa tu bandeja.');
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) { clearInterval(interval); return 0; }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(data.message || 'Error al reenviar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const onSubmit = async (e) => {
      e.preventDefault();
      setShowResend(false);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success && data.data.token) {
        login(data.data.user, data.data.token);
        console.log('Token y Usuario guardados. Contexto actualizado.');
        toast.success('¡Login exitoso!');
       
        setTimeout(() => {
            navigate('/');
        }, 1500);
      } else {
        const errorMessage = data.errors
            ? data.errors.map(err => err.msg).join(', ')
            : data.message || 'Error desconocido';
        
        // Detectar si es error de verificación
        if (data.message && data.message.includes('no ha sido verificada')) {
          setShowResend(true);
        }
        
        toast.error('Error en login: ' + errorMessage);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al iniciar sesión. Revisa la consola.');
    }
  };

  return (
    <div className="form-wrapper">
      <form onSubmit={onSubmit} className="form-container">
        <div className="form-header">
          <h2>⚔️ Iniciar Sesión</h2>
        </div>
        <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" required />
        <input type="password" name="password" value={password} onChange={onChange} placeholder="Contraseña" required />
        <button type="submit" className="btn btn-primary btn-block">Iniciar Sesión</button>

        {showResend && (
          <div className="resend-verification-box">
            <p>⚠️ Tu cuenta no ha sido verificada.</p>
            <button
              type="button"
              onClick={handleResendVerification}
              className="btn btn-resend"
              disabled={resendCooldown > 0}
            >
              {resendCooldown > 0
                ? `📧 Reenviar en ${resendCooldown}s`
                : '📧 Reenviar correo de verificación'}
            </button>
          </div>
        )}

        <p className="form-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;