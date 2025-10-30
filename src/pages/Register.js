import React, { useEffect, useMemo, useState } from 'react';
import '../styles/Register.css';
import Calendar from '../shared/Calendar';
import { getAvailability, addRegistration, getCurrentUserFromStorage } from '../services/storage';

const initialForm = {
  parentName: '',
  parentPhone: '',
  parentEmail: '',
  studentName: '',
  studentAge: '',
  studentLeerjaar: '',
  studentStudierichting: '',
  moreKids: 'no'
};

function Register({ onAuthChange }) {
  const [form, setForm] = useState(initialForm);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [availability, setAvailability] = useState({});
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setAvailability(getAvailability());
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const canSubmit = useMemo(() => {
    return (
      form.parentName && form.parentPhone && form.parentEmail && form.studentName &&
      form.studentAge && form.studentLeerjaar && form.studentStudierichting &&
      selectedSlots.length > 0
    );
  }, [form, selectedSlots]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = getCurrentUserFromStorage();
    if (!user) {
      alert('Log in of registreer eerst om te kunnen inschrijven.');
      // trigger header modal by changing hash => header button
      onAuthChange && onAuthChange(user);
      return;
    }
    addRegistration({
      ...form,
      userId: user.id,
      slots: selectedSlots,
      status: 'pending',
      createdAt: Date.now()
    });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="Register">
        <h2>Inschrijving verzonden</h2>
        <p>Je aanvraag is ingediend en verschijnt op de goedkeuringspagina voor de admin.</p>
        <a className="btn" href="#/home">Terug naar Home</a>
      </div>
    );
  }

  return (
    <div className="Register">
      <h2>Inschrijfformulier</h2>
      <form className="Form" onSubmit={handleSubmit}>
        <div className="Form__grid">
          <label>
            <span>Naam ouder/voogd</span>
            <input name="parentName" value={form.parentName} onChange={handleChange} required />
          </label>
          <label>
            <span>Telefoon ouder/voogd</span>
            <input name="parentPhone" value={form.parentPhone} onChange={handleChange} required />
          </label>
          <label>
            <span>E-mail ouder/voogd</span>
            <input type="email" name="parentEmail" value={form.parentEmail} onChange={handleChange} required />
          </label>
          <label>
            <span>Naam leerling</span>
            <input name="studentName" value={form.studentName} onChange={handleChange} required />
          </label>
          <label>
            <span>Leeftijd leerling</span>
            <input name="studentAge" value={form.studentAge} onChange={handleChange} required />
          </label>
          <label>
            <span>Leerjaar</span>
            <input name="studentLeerjaar" value={form.studentLeerjaar} onChange={handleChange} required />
          </label>
          <label>
            <span>Studierichting</span>
            <input name="studentStudierichting" value={form.studentStudierichting} onChange={handleChange} required />
          </label>
          <label>
            <span>Meerdere kinderen?</span>
            <select name="moreKids" value={form.moreKids} onChange={handleChange}>
              <option value="no">Nee</option>
              <option value="yes">Ja</option>
            </select>
          </label>
        </div>
        <div className="CalendarSection">
          <h3>Kies je lesblokken (max. 2 per dag)</h3>
          <p className="hint">Groen = beschikbaar, rood = bezet, grijs = niet beschikbaar. Je kan meerdere uren selecteren, maar maximaal 2 per dag.</p>
          <Calendar
            availability={availability}
            selectedSlots={selectedSlots}
            onChangeSelected={setSelectedSlots}
            readOnly={false}
          />
        </div>
        <div className="Form__actions">
          <button className="btn btn-primary" disabled={!canSubmit} type="submit">Verzenden</button>
        </div>
      </form>
    </div>
  );
}

export default Register;


