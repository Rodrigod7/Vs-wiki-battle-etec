// frontend/src/components/UserProfileConfig.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ImageUploader from './ImageUploader';
import './Forms.css'; 
import './UserProfileConfig.css'; 

const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const UserProfileConfig = () => {
  const { isLoggedIn, updateUserContext } = useAuth();
  const [formData, setFormData] = useState({
    username: '', email: '', role: '', avatar: '', newPassword: '', confirmNewPassword: ''
  });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Sesión no válida.');
      setLoading(false);
      return;
    }
    const userPayload = decodeToken(token);
    if (!userPayload || !userPayload.id) {
      toast.error('Token inválido.');
      setLoading(false);
      return;
    }
    setUserId(userPayload.id);
    
    const fetchUserData = async () => {
      try {
        // ✅ CORREGIDO: Usamos /me en lugar de ID explícito
        const res = await fetch(`/api/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setFormData({
            username: data.data.username || '',
            email: data.data.email || '',
            role: data.data.role || 'usuario',
            avatar: data.data.avatar || '', 
            newPassword: '', confirmNewPassword: ''
          });
        } else {
          toast.error(data.message || 'Error al cargar perfil.');
        }
      } catch (error) {
        console.error('Fetch user data error:', error);
        toast.error('Error de conexión.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [isLoggedIn]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleAvatarUploaded = (imageUrl) => setFormData({ ...formData, avatar: imageUrl });

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (formData.newPassword !== formData.confirmNewPassword) return toast.error('Contraseñas no coinciden.');
    
    const dataToSend = {
      username: formData.username,
      email: formData.email,
      avatar: formData.avatar,
      ...(formData.newPassword && { password: formData.newPassword })
    };

    try {
      // ✅ CORREGIDO: Usamos /me para actualizar
      const res = await fetch(`/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend), 
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Perfil actualizado.');
        updateUserContext(data.data);
        setFormData(prev => ({ ...prev, newPassword: '', confirmNewPassword: '' }));
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      toast.error('Error de conexión.');
    }
  };

  if (loading) return <div className="profile-config-container"><p>Cargando...</p></div>;
  if (!userId) return <div className="profile-config-container"><p>Acceso denegado.</p></div>;

  return (
    <div className="profile-config-container">
      <h2>Configuración</h2>
      <form onSubmit={onSubmit} className="form-container user-config-form">
        <div className="form-section-title">Foto de Perfil</div>
        <ImageUploader currentImage={formData.avatar} onImageUploaded={handleAvatarUploaded} type="users" label="Foto de Perfil" />
        <div className="form-section-title">Datos Básicos</div>
        <input type="text" name="username" value={formData.username} onChange={onChange} placeholder="Usuario" />
        <input type="email" name="email" value={formData.email} onChange={onChange} placeholder="Email" />
        <select name="role" value={formData.role} disabled={true}><option value="usuario">Usuario</option><option value="vendedor">Vendedor</option></select>
        <div className="form-section-title">Cambiar Contraseña</div>
        <input type="password" name="newPassword" value={formData.newPassword} onChange={onChange} placeholder="Nueva Contraseña" />
        <input type="password" name="confirmNewPassword" value={formData.confirmNewPassword} onChange={onChange} placeholder="Confirmar Contraseña" />
        <button type="submit" className="btn btn-primary">Guardar Cambios</button>
      </form>
    </div>
  );
};

export default UserProfileConfig;