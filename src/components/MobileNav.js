import React, { useState } from 'react';
import { FiHome, FiEdit3, FiList, FiCalendar, FiInbox, FiLogIn, FiLogOut } from 'react-icons/fi';
import '../styles/Layout.css';
import AuthModal from './auth/AuthModal';
import { signOut, getCurrentUserFromStorage } from '../services/storage';

function MobileNav({ currentUser, onAuthChange }) {
  const [showAuth, setShowAuth] = useState(false);

  const handleLogout = async () => {
    await signOut();
    if (onAuthChange) {
      onAuthChange(await getCurrentUserFromStorage());
    }
    window.location.hash = '#/home';
  };

  return (
    <>
      <nav className="MobileNav">
        <a href="#/home" className="MobileNav__link">
          <FiHome aria-hidden="true" />
          <span>Home</span>
        </a>
        <a href="#/register" className="MobileNav__link">
          <FiEdit3 aria-hidden="true" />
          <span>Inschrijven</span>
        </a>
        {currentUser && currentUser.role === 'parent' && (
          <a href="#/my-requests" className="MobileNav__link">
            <FiList aria-hidden="true" />
            <span>Mijn</span>
          </a>
        )}
        {currentUser && currentUser.role === 'admin' && (
          <>
            <a href="#/admin" className="MobileNav__link">
              <FiCalendar aria-hidden="true" />
              <span>Beschikbaar</span>
            </a>
            <a href="#/approve" className="MobileNav__link">
              <FiInbox aria-hidden="true" />
              <span>Reserveringen</span>
            </a>
          </>
        )}
        {!currentUser ? (
          <button
            type="button"
            className="MobileNav__link MobileNav__link--button"
            onClick={() => setShowAuth(true)}
          >
            <FiLogIn aria-hidden="true" />
            <span>Login</span>
          </button>
        ) : (
          <button
            type="button"
            className="MobileNav__link MobileNav__link--button"
            onClick={handleLogout}
          >
            <FiLogOut aria-hidden="true" />
            <span>Uitloggen</span>
          </button>
        )}
      </nav>
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onAuthChange={onAuthChange} />
      )}
    </>
  );
}

export default MobileNav;
