import React, { useEffect, useState, useMemo } from 'react';
import '../styles/Admin.css';
import Calendar from '../shared/Calendar';
import { getCurrentUserFromStorage, getAvailability, setAvailability, getRegistrations } from '../services/storage';

function Admin({ currentUser, onAuthChange }) {
  const [availability, setAvail] = useState({});
  const [registrations, setRegistrations] = useState([]);
  const [saved, setSaved] = useState(false);

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
      setAvail(await getAvailability());
      setRegistrations(await getRegistrations());
    }
    load();
  }, [currentUser, onAuthChange]);

  const stats = useMemo(() => {
    const total = Object.keys(availability).length;
    const available = Object.values(availability).filter(v => v === 'available').length;
    const occupied = Object.values(availability).filter(v => v === 'occupied').length;
    const unavailable = Object.values(availability).filter(v => v === 'unavailable').length;
    return { total, available, occupied, unavailable };
  }, [availability]);

  const handleToggle = (slots) => {
    const updated = { ...availability };
    slots.forEach((s) => {
      updated[s] = updated[s] === 'available' ? 'unavailable' : 'available';
    });
    setAvail(updated);
    setSaved(false);
  };

  const handleBulkAction = (action) => {
    const updated = { ...availability };
    const HOURS = Array.from({ length: 10 }).map((_, i) => 9 + i);
    const DAYS = Array.from({ length: 14 }).map((_, i) => i);
    
    DAYS.forEach(dayIdx => {
      HOURS.forEach(hour => {
        const slotId = `${dayIdx}-${hour}`;
        if (action === 'all-available') {
          updated[slotId] = 'available';
        } else if (action === 'all-unavailable') {
          updated[slotId] = 'unavailable';
        } else if (action === 'weekdays-available') {
          if (dayIdx < 5) { // Monday to Friday
            updated[slotId] = 'available';
          }
        } else if (action === 'weekends-available') {
          if (dayIdx >= 5) { // Saturday and Sunday
            updated[slotId] = 'available';
          }
        }
      });
    });
    setAvail(updated);
    setSaved(false);
  };

  const handleSave = async () => {
    await setAvailability(availability);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="Admin">
      <h2>📅 Beschikbare uren instellen</h2>
      <p className="hint">
        <strong>💡 Tip:</strong> Klik op tijdstippen om beschikbaarheid te wijzigen. 
        Groen = beschikbaar, grijs = niet beschikbaar, rood = bezet. 
        Gebruik de bulk acties om snel meerdere tijdstippen in te stellen.
      </p>
      
      <div className="Admin__stats">
        <div className="Admin__stat">
          <h3>Beschikbaar</h3>
          <p>{stats.available}</p>
        </div>
        <div className="Admin__stat">
          <h3>Bezet</h3>
          <p>{stats.occupied}</p>
        </div>
        <div className="Admin__stat">
          <h3>Niet beschikbaar</h3>
          <p>{stats.unavailable}</p>
        </div>
        <div className="Admin__stat">
          <h3>Totaal slots</h3>
          <p>{stats.total}</p>
        </div>
      </div>

      <div className="Admin__controls">
        <button className="btn" onClick={() => handleBulkAction('all-available')}>
          ✓ Alles beschikbaar maken
        </button>
        <button className="btn" onClick={() => handleBulkAction('all-unavailable')}>
          ✗ Alles niet beschikbaar maken
        </button>
        <button className="btn" onClick={() => handleBulkAction('weekdays-available')}>
          📅 Weekdagen beschikbaar
        </button>
        <button className="btn" onClick={() => handleBulkAction('weekends-available')}>
          🎉 Weekend beschikbaar
        </button>
      </div>

      <Calendar
        availability={availability}
        registrations={registrations}
        onToggleAvailability={handleToggle}
        selectedSlots={[]}
        onChangeSelected={() => {}}
        readOnly={false}
        adminEdit
      />
      
      <div className="Actions">
        {saved && (
          <div style={{
            padding: '12px 20px',
            background: 'rgba(16,185,129,0.1)',
            color: 'var(--color-success)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ✓ Opgeslagen!
          </div>
        )}
        <button className="btn btn-primary" onClick={handleSave}>
          💾 Opslaan
        </button>
      </div>
    </div>
  );
}

export default Admin;


