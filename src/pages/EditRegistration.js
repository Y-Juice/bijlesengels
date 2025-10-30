import React, { useEffect, useMemo, useState } from 'react';
import '../styles/Register.css';
import Calendar from '../shared/Calendar';
import { getAvailability, getRegistrations, updateRegistration, getCurrentUserFromStorage } from '../services/storage';

function parseId() {
  const hash = window.location.hash; // #/edit/<id>
  const parts = hash.split('/');
  return parts[2] || '';
}

function EditRegistration() {
  const [availability, setAvailability] = useState({});
  const [reg, setReg] = useState(null);
  const [form, setForm] = useState({});
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const user = getCurrentUserFromStorage();
    if (!user) { window.location.hash = '#/home'; return; }
    setAvailability(getAvailability());
    const id = parseId();
    const found = getRegistrations().find((r) => r.id === id && r.userId === user.id);
    if (!found) { window.location.hash = '#/my-requests'; return; }
    setReg(found);
    setForm({
      parentName: found.parentName,
      parentPhone: found.parentPhone,
      parentEmail: found.parentEmail,
      studentName: found.studentName,
      studentAge: found.studentAge,
      studentLeerjaar: found.studentLeerjaar,
      studentStudierichting: found.studentStudierichting,
      moreKids: found.moreKids
    });
    setSelectedSlots(found.slots || []);
  }, []);

  const canSubmit = useMemo(() => reg && selectedSlots.length > 0, [reg, selectedSlots]);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = (e) => {
    e.preventDefault();
    if (!reg) return;
    updateRegistration(reg.id, { ...form, slots: selectedSlots });
    setSaved(true);
  };

  if (!reg) return null;
  if (saved) {
    return (
      <div className="Register">
        <h2>Inschrijving bijgewerkt</h2>
        <a className="btn" href="#/my-requests">Terug naar mijn inschrijvingen</a>
      </div>
    );
  }

  return (
    <div className="Register">
      <h2>Inschrijving bewerken</h2>
      <form className="Form" onSubmit={save}>
        <div className="Form__grid">
          {['parentName','parentPhone','parentEmail','studentName','studentAge','studentLeerjaar','studentStudierichting'].map((key) => (
            <label key={key}>
              <span>{key}</span>
              <input name={key} value={form[key] || ''} onChange={handleChange} required />
            </label>
          ))}
          <label>
            <span>Meerdere kinderen?</span>
            <select name="moreKids" value={form.moreKids || 'no'} onChange={handleChange}>
              <option value="no">Nee</option>
              <option value="yes">Ja</option>
            </select>
          </label>
        </div>
        <div className="CalendarSection">
          <h3>Pas je slots aan (max. 2 per dag)</h3>
          <Calendar
            availability={availability}
            selectedSlots={selectedSlots}
            onChangeSelected={setSelectedSlots}
            readOnly={false}
          />
        </div>
        <div className="Form__actions">
          <button className="btn btn-primary" disabled={!canSubmit} type="submit">Opslaan</button>
        </div>
      </form>
    </div>
  );
}

export default EditRegistration;


