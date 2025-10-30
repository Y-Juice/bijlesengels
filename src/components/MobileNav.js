import React from 'react';
import '../styles/Layout.css';

function MobileNav({ currentUser }) {
  return (
    <nav className="MobileNav">
      <a href="#/home" className="MobileNav__link">Home</a>
      <a href="#/register" className="MobileNav__link">Inschrijven</a>
      {currentUser && currentUser.role === 'parent' && (
        <a href="#/my-requests" className="MobileNav__link">Mijn</a>
      )}
      {currentUser && currentUser.role === 'admin' && (
        <a href="#/admin" className="MobileNav__link">Admin</a>
      )}
    </nav>
  );
}

export default MobileNav;


