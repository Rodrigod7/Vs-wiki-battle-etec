import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
      e.preventDefault();
      try {
        // ✅ CORREGIDO: Ruta relativa
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
        toast.error('Error en login: ' + errorMessage);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al iniciar sesión. Revisa la consola.');
    }
  };

  return (
    <form onSubmit={onSubmit} className="form-container">
      <h2>Login</h2>
      <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" required />
      <input type="password" name="password" value={password} onChange={onChange} placeholder="Contraseña" required />
      <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
    </form>
  );
};

export default Login;