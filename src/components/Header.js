import React, { useState } from 'react';
import '../styles/Header.css';
import AuthModal from './auth/AuthModal';
import { signOut, getCurrentUserFromStorage } from '../services/storage';
import logo from '../assets/logobijlessen.png';

function Header({ currentUser, onAuthChange }) {
  const [showAuth, setShowAuth] = useState(false);

  const handleLogout = () => {
    (async () => {
      await signOut();
      onAuthChange(await getCurrentUserFromStorage());
      window.location.hash = '#/home';
    })();
  };

  return (
    <header className="Header">
      <div className="Header__brand" onClick={() => (window.location.hash = '#/home')}>
        <img src={logo} alt="Bijles Engels Logo" className="Header__logo" />
        <span className="Header__title">BIJLESSEN ENGELS</span>
      </div>
      <nav className="Header__nav">
        <a href="#/home" className="Header__link">Home</a>
        <a href="#/register" className="Header__link">Inschrijven</a>
        {currentUser && currentUser.role === 'parent' && (
          <a href="#/my-requests" className="Header__link">Mijn inschrijvingen</a>
        )}
        {currentUser && currentUser.role === 'admin' && (
          <>
            <a href="#/admin" className="Header__link">Beschikbaarheden</a>
            <a href="#/approve" className="Header__link">Aanvragen</a>
          </>
        )}
      </nav>
      <div className="Header__auth">
        {!currentUser ? (
          <button className="btn btn-primary" onClick={() => setShowAuth(true)}>Log in / Registreer</button>
        ) : (
          <div className="Header__user">
            <span className="Header__welcome">{currentUser.role === 'admin' ? 'Admin' : 'Ouder'}</span>
            <button className="btn" onClick={handleLogout}>Uitloggen</button>
          </div>
        )}
      </div>
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onAuthChange={onAuthChange} />
      )}
    </header>
  );
}

export default Header;


