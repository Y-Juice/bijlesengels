import React, { useEffect, useState } from 'react';
import '../styles/Admin.css';
import Calendar from '../shared/Calendar';
import { getCurrentUserFromStorage, getAvailability, setAvailability } from '../services/storage';

function Admin({ onAuthChange }) {
  const [availability, setAvail] = useState({});

  useEffect(() => {
    const user = getCurrentUserFromStorage();
    if (!user || user.role !== 'admin') {
      window.location.hash = '#/home';
      return;
    }
    setAvail(getAvailability());
  }, []);

  const handleToggle = (slots) => {
    const updated = { ...availability };
    slots.forEach((s) => {
      updated[s] = updated[s] === 'available' ? 'unavailable' : 'available';
    });
    setAvail(updated);
  };

  const handleSave = () => {
    setAvailability(availability);
    alert('Beschikbaarheden opgeslagen');
  };

  return (
    <div className="Admin">
      <h2>Beschikbare uren instellen</h2>
      <p className="hint">Klik op slots om beschikbaarheid te togglen. Groen = beschikbaar, grijs = niet beschikbaar.</p>
      <Calendar
        availability={availability}
        onToggleAvailability={handleToggle}
        selectedSlots={[]}
        onChangeSelected={() => {}}
        readOnly={false}
        adminEdit
      />
      <div className="Actions">
        <button className="btn btn-primary" onClick={handleSave}>Opslaan</button>
      </div>
    </div>
  );
}

export default Admin;


