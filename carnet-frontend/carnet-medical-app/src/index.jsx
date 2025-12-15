// /home/viviane/TP JIOMEKONG/carnet-frontend/carnet-medical-app/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Importe le composant principal de votre application (à adapter si vous l'avez nommé App.jsx)
import './styles/app.css'; // Importe vos styles globaux

// Utilisation de la nouvelle API de rendu de React 18+
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);