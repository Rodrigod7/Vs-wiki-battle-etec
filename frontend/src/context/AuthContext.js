// src/context/AuthContext.js (MODIFICADO)

import React, { createContext, useState, useContext } from 'react';
import { toast } from 'react-hot-toast';

// 1. Crear el Contexto
const AuthContext = createContext(null);

// 2. Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
    return useContext(AuthContext);
};

// 3. Proveedor del Contexto
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const isLoggedIn = !!user;

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData)); 
        setUser(userData); 
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user'); 
        setUser(null); 
        toast.success('Sesión cerrada correctamente.'); 
    };

    // --- ¡NUEVA FUNCIÓN! ---
    // La usamos para actualizar el 'user' en el contexto y localStorage
    // después de editar el perfil.
    const updateUserContext = (newUserData) => {
        setUser(currentUser => {
            // Combina los datos antiguos con los nuevos
            const updatedUser = { ...currentUser, ...newUserData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };
    // -----------------------

    const value = {
        isLoggedIn,
        user,
        login,
        logout,
        updateUserContext // <-- Exponemos la nueva función
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};