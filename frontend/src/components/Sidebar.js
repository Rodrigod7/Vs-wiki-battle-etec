import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { isLoggedIn, logout, user } = useAuth();
   
    // ✅ CORREGIDO: Cambiado a placehold.co que es más estable
    const avatar = user && user.avatar
        ? user.avatar
        : 'https://placehold.co/60x60/3498db/FFFFFF?text=P';
           
    const username = user ? user.username : 'Guerrero';

    const handleLogout = () => {
        logout();
        navigate('/');
        onClose();
    };

    const navigateAndClose = (path) => {
        navigate(path);
        onClose();
    };

    return (
        <>
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-content">
                   
                    {isLoggedIn && user && (
                        <div className="sidebar-profile">
                            <div className="profile-info">
                                <img
                                    src={avatar}
                                    alt="Perfil"
                                    className="profile-photo"
                                    onError={(e) => {
                                        e.target.src = 'https://placehold.co/60x60/3498db/FFFFFF?text=P';
                                    }}
                                />
                                <span className="profile-name">{username}</span>
                            </div>
                            <button
                                onClick={() => navigateAndClose('/configure-user')}
                                className="btn btn-config"
                            >
                                ⚙️ Configurar Cuenta
                            </button>
                        </div>
                    )}
                   
                    <h3>Navegación</h3>

                    {isLoggedIn ? (
                        <>
                            <button onClick={() => navigateAndClose('/create-character')} className="sidebar-btn">
                                ⚔️ Crear Personaje
                            </button>
                            <button onClick={() => navigateAndClose('/manage-characters')} className="sidebar-btn">
                                📝 Mis Personajes
                            </button>
                            <button onClick={() => navigateAndClose('/messages')} className="sidebar-btn">
                                💬 Mensajes
                            </button>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '10px 0' }}></div>

                            <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%' }}>
                                🚪 Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigateAndClose('/login')} className="btn btn-primary" style={{ width: '100%', marginBottom: '10px' }}>
                                🔑 Iniciar Sesión
                            </button>
                            <button onClick={() => navigateAndClose('/register')} className="btn btn-secondary" style={{ width: '100%' }}>
                                📝 Registrarse
                            </button>
                        </>
                    )}
                </div>
            </div>
            {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
        </>
    );
};

export default Sidebar;