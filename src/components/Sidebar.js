import React from 'react';
import '../styles/Layout.css';

function Sidebar({ currentUser }) {
  return (
    <aside className="Sidebar">
      <div className="Sidebar__brand">Bijles Engels</div>
      <nav className="Sidebar__nav">
        <a href="#/home" className="Sidebar__link">Home</a>
        <a href="#/register" className="Sidebar__link">Inschrijven</a>
        {currentUser && currentUser.role === 'parent' && (
          <a href="#/my-requests" className="Sidebar__link">Mijn inschrijvingen</a>
        )}
        {currentUser && currentUser.role === 'admin' && (
          <>
            <a href="#/admin" className="Sidebar__link">Beschikbaarheden</a>
            <a href="#/approve" className="Sidebar__link">Aanvragen</a>
          </>
        )}
      </nav>
      <div className="Sidebar__footer">© {new Date().getFullYear()}</div>
    </aside>
  );
}

export default Sidebar;


