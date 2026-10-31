import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './GameApp.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
