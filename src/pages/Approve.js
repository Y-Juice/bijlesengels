import React, { useEffect, useState } from 'react';
import '../styles/Approve.css';
import { getCurrentUserFromStorage, getRegistrations, updateRegistrationStatus } from '../services/storage';

function Approve() {
  const [regs, setRegs] = useState([]);

  useEffect(() => {
    const user = getCurrentUserFromStorage();
    if (!user || user.role !== 'admin') {
      window.location.hash = '#/home';
      return;
    }
    setRegs(getRegistrations().filter((r) => r.status === 'pending'));
  }, []);

  const act = (id, status) => {
    updateRegistrationStatus(id, status);
    setRegs(getRegistrations().filter((r) => r.status === 'pending'));
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


