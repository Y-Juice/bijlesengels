import React, { useEffect, useState } from 'react';
import '../styles/Approve.css';
import { getCurrentUserFromStorage, getRegistrations, updateRegistrationStatus } from '../services/storage';

function Approve({ currentUser, onAuthChange }) {
  const [regs, setRegs] = useState([]);

  useEffect(() => {
    async function load() {
      // Use currentUser prop first, fallback to checking storage
      let user = currentUser;
      if (!user) {
        user = await getCurrentUserFromStorage();
        if (onAuthChange) {
          onAuthChange(user);
        }
      }
      
      if (!user || user.role !== 'admin') {
        window.location.hash = '#/home';
        return;
      }
      const all = await getRegistrations();
      setRegs((all || []).filter((r) => r.status === 'pending'));
    }
    load();
  }, [currentUser, onAuthChange]);

  const act = (id, status) => {
    (async () => {
      await updateRegistrationStatus(id, status);
      const all = await getRegistrations();
      setRegs((all || []).filter((r) => r.status === 'pending'));
    })();
  };

  return (
    <div className="Approve">
      <h2>Inschrijvingen ter goedkeuring</h2>
      {regs.length === 0 ? (
        <p>Geen openstaande aanvragen.</p>
      ) : (
        <ul className="Approve__list">
          {regs.map((r) => (
            <li key={r.id} className="Approve__item">
              <div className="Approve__info">
                <strong>{r.studentName}</strong> — {r.studentLeerjaar} — {r.studentStudierichting}
                <div className="Approve__meta">
                  Ouder: {r.parentName} ({r.parentEmail}, {r.parentPhone})
                </div>
                <div className="Approve__slots">
                  Slots: {r.slots.join(', ')}
                </div>
              </div>
              <div className="Approve__actions">
                <button className="btn" onClick={() => act(r.id, 'denied')}>Weiger</button>
                <button className="btn btn-primary" onClick={() => act(r.id, 'approved')}>Keur goed</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Approve;


