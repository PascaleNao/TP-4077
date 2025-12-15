// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, registerPatient } from '../api/medicalApi';
import { jwtDecode } from 'jwt-decode'; // Nécessite l'installation : npm install jwt-decode

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Initialisation de l'état à partir du stockage local
const getInitialState = () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const decoded = jwtDecode(token);
            // Vérifier l'expiration du token
            if (decoded.exp * 1000 > Date.now()) {
                // IMPORTANT : Si l'ID et le RÔLE sont dans le JWT, l'e-mail peut être stocké séparément.
                // Nous allons faire simple ici :
                return {
                    isAuthenticated: true,
                    // Note: Le champ 'user' doit contenir le minimum requis pour ne pas surcharger le token
                    user: { id: decoded.id, role: decoded.role },
                    token,
                };
            }
        } catch (error) {
            console.error("Erreur de décodage ou token expiré:", error);
            localStorage.removeItem('token');
        }
    }
    return {
        isAuthenticated: false,
        user: null,
        token: null,
    };
};

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState(getInitialState);

    // Fonction de connexion unifiée
    const login = async (email, password, role) => {
        try {
            const res = await apiLogin(email, password, role);

            // 🚨 CORRECTION CRUCIALE 🚨 : La réponse du backend renvoie 'token' et 'user' (qui contient les infos).
            // Le backend ne renvoie plus 'patient' ou 'medecinInfo'.
            const { token, user: userInfo } = res.data;

            // userInfo contient { id, nom, prenom, email, role... }
            const decoded = jwtDecode(token);

            localStorage.setItem('token', token);
            setAuthState({
                isAuthenticated: true,
                user: {
                    id: decoded.id, // L'ID du JWT
                    role: decoded.role, // Le rôle du JWT
                    ...userInfo // Les autres informations (nom, prenom, email...)
                },
                token,
            });

            // L'appel depuis PatientLogin.jsx attend un succès: true
            return { success: true };

        } catch (error) {
            // L'erreur est gérée ici. S'il y a une erreur HTTP (401, 500), Axios la capture.
            const message = error.response?.data?.message || 'Échec de l’authentification.';

            // L'appel depuis PatientLogin.jsx attend un success: false et un message
            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
        });
    };

    // La fonction d'enregistrement (similaire à login)
    const register = async (data) => {
        try {
            const res = await registerPatient(data);

            // 🚨 CORRECTION POUR L'ENREGISTREMENT 🚨 : Idem, on utilise 'user'
            const { token, user: userInfo } = res.data;

            // Simuler la connexion après l'enregistrement
            const decoded = jwtDecode(token);
            localStorage.setItem('token', token);
            setAuthState({
                isAuthenticated: true,
                user: {
                    id: decoded.id,
                    role: decoded.role,
                    ...userInfo // Ajout des infos utilisateur
                },
                token,
            });
            return { success: true };

        } catch (error) {
            const message = error.response?.data?.message || 'Échec de l’enregistrement.';
            return { success: false, message };
        }
    };

    return (
        <AuthContext.Provider value={{ ...authState, login, logout, register, setAuthState }}>
            {children}
        </AuthContext.Provider>
    );
};