import React, { useEffect, useMemo, useState } from 'react';
import '../styles/Approve.css';
import { getCurrentUserFromStorage, getRegistrations, updateRegistrationStatus, deleteRegistration } from '../services/storage';
import { formatSlotsDisplay } from '../utils/slots';

const STATUS_LABELS = {
  pending: 'In afwachting',
  approved: 'Goedgekeurd',
  denied: 'Geweigerd'
};

const FILTERS = [
  { value: 'pending', label: 'In afwachting' },
  { value: 'approved', label: 'Goedgekeurd' },
  { value: 'denied', label: 'Geweigerd' },
  { value: 'all', label: 'Alle' }
];

function Approve({ currentUser, onAuthChange }) {
  const [regs, setRegs] = useState([]);
  const [filter, setFilter] = useState('pending');

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
      setRegs(await getRegistrations());
    }
    load();
  }, [currentUser, onAuthChange]);

  const refresh = async () => {
    setRegs(await getRegistrations());
  };

  const act = (id, status) => {
    (async () => {
      await updateRegistrationStatus(id, status);
      await refresh();
    })();
  };

  const remove = (id) => {
    (async () => {
      if (!window.confirm('Weet je zeker dat je deze reservering wilt verwijderen?')) return;
      await deleteRegistration(id);
      await refresh();
    })();
  };

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, denied: 0, all: regs.length };
    regs.forEach((r) => {
      if (c[r.status] !== undefined) c[r.status] += 1;
    });
    return c;
  }, [regs]);

  const shown = useMemo(
    () => (filter === 'all' ? regs : regs.filter((r) => r.status === filter)),
    [regs, filter]
  );

  return (
    <div className="Approve">
      <h2>Reserveringen beheren</h2>
      <div className="Approve__filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`btn ${filter === f.value ? 'btn-primary' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label} ({counts[f.value]})
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p>Geen reserveringen gevonden.</p>
      ) : (
        <ul className="Approve__list">
          {shown.map((r) => (
            <li key={r.id} className="Approve__item">
              <div className="Approve__info">
                <strong>{r.studentName}</strong> — {r.studentLeerjaar} — {r.studentStudierichting}
                <span className={`Approve__status Approve__status--${r.status}`}>
                  {STATUS_LABELS[r.status] || r.status}
                </span>
                <div className="Approve__meta">
                  Ouder: {r.parentName} ({r.parentEmail}, {r.parentPhone})
                </div>
                <div className="Approve__slots">
                  Tijdstippen: {formatSlotsDisplay(r.slots)}
                </div>
              </div>
              <div className="Approve__actions">
                {r.status !== 'denied' && (
                  <button className="btn" onClick={() => act(r.id, 'denied')}>Weiger</button>
                )}
                {r.status !== 'approved' && (
                  <button className="btn btn-primary" onClick={() => act(r.id, 'approved')}>Keur goed</button>
                )}
                <button className="btn" onClick={() => (window.location.hash = `#/edit/${r.id}`)}>Bewerken</button>
                <button className="btn Approve__deleteBtn" onClick={() => remove(r.id)}>Verwijder</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Approve;
