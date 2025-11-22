// frontend/src/components/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Forms.css';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
   
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const { username, email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Enviamos role: 'usuario' automáticamente
        body: JSON.stringify({ ...formData, role: 'usuario' }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('¡Cuenta creada! Revisa tu correo.');
        // Redirigir al login para que verifiquen o entren
        setTimeout(() => {
            navigate('/login');
        }, 2000);
      } else {
        const errorMessage = data.errors
            ? data.errors.map(err => err.msg).join(', ')
            : data.message || 'Error desconocido.';
        toast.error(`❌ Error: ${errorMessage}`);
      }

    } catch (error) {
      console.error(error);
      toast.error('Error de conexión.');
    }
  };

  return (
    <div className="form-wrapper">
      <form onSubmit={onSubmit} className="form-container register-form">
        <div className="form-header">
          <h2>⚔️ Únete a VS Wiki Battle</h2>
          <p>Crea tu cuenta y comienza a diseñar personajes épicos</p>
        </div>

        <input 
          type="text" 
          name="username" 
          value={username} 
          onChange={onChange} 
          placeholder="Nombre de Usuario" 
          required 
          minLength={3}
          maxLength={30}
        />
        
        <input 
          type="email" 
          name="email" 
          value={email} 
          onChange={onChange} 
          placeholder="Correo Electrónico (Institucional o Gmail)" 
          required 
        />
        
        <input 
          type="password" 
          name="password" 
          value={password} 
          onChange={onChange} 
          placeholder="Contraseña" 
          required 
          minLength={6}
        />

        {/* Caja de Requisitos (Como en tu imagen) */}
        <div className="requirements-box">
          <h4>💡 Requisitos:</h4>
          <ul>
            <li>Usuario: 3-30 caracteres (letras, números, guiones)</li>
            <li>Contraseña: Mínimo 6 caracteres con al menos un número</li>
          </ul>
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          ⚔️ Crear Cuenta
        </button>

        <p className="form-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
