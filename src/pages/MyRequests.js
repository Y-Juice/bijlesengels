import React, { useEffect, useState } from 'react';
import '../styles/MyRequests.css';
import { getCurrentUserFromStorage, getUserRegistrations, deleteRegistration } from '../services/storage';

function MyRequests() {
  const [list, setList] = useState([]);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUserFromStorage();
      if (!user) { window.location.hash = '#/home'; return; }
      setList(await getUserRegistrations(user.id));
    }
    load();
  }, []);

  const refresh = () => {
    (async () => {
      const user = await getCurrentUserFromStorage();
      if (!user) return;
      setList(await getUserRegistrations(user.id));
    })();
  };

  const cancel = (id) => {
    (async () => {
      if (!window.confirm('Weet je zeker dat je deze inschrijving wilt annuleren?')) return;
      await deleteRegistration(id);
      refresh();
    })();
  };

  const edit = (id) => {
    window.location.hash = `#/edit/${id}`;
  };

  return (
    <div className="MyRequests">
      <h2>Mijn inschrijvingen</h2>
      {list.length === 0 ? (
        <p>Je hebt nog geen inschrijvingen.</p>
      ) : (
        <ul className="ReqList">
          {list.map((r) => (
            <li key={r.id} className="ReqItem">
              <div className="ReqInfo">
                <strong>{r.studentName}</strong> — {r.studentLeerjaar} — {r.studentStudierichting}
                <div className="ReqMeta">Status: {r.status}</div>
                <div className="ReqSlots">Slots: {r.slots.join(', ')}</div>
              </div>
              <div className="ReqActions">
                <button className="btn" onClick={() => cancel(r.id)}>Annuleer</button>
                <button className="btn btn-primary" onClick={() => edit(r.id)}>Bewerken</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyRequests;


