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
    async function load() {
      const user = await getCurrentUserFromStorage();
      if (!user) { window.location.hash = '#/home'; return; }
      setAvailability(await getAvailability());
      const id = parseId();
      const regs = await getRegistrations();
      const found = (regs || []).find((r) => r.id === id && r.userId === user.id);
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
    }
    load();
  }, []);

  const canSubmit = useMemo(() => reg && selectedSlots.length > 0, [reg, selectedSlots]);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = (e) => {
    e.preventDefault();
    if (!reg) return;
    (async () => {
      await updateRegistration(reg.id, { ...form, slots: selectedSlots });
      setSaved(true);
    })();
  };

  const fieldLabels = {
    parentName: 'Naam ouder/voogd',
    parentPhone: 'Telefoon ouder/voogd',
    parentEmail: 'E-mail ouder/voogd',
    studentName: 'Naam leerling',
    studentAge: 'Leeftijd leerling',
    studentLeerjaar: 'Leerjaar',
    studentStudierichting: 'Studierichting'
  };

  if (!reg) return null;
  if (saved) {
    return (
      <div className="Register">
        <div className="card" style={{textAlign: 'center', padding: '48px 32px'}}>
          <div style={{fontSize: '4rem', marginBottom: '16px'}}>✅</div>
          <h2>Inschrijving bijgewerkt!</h2>
          <p style={{marginTop: '12px', marginBottom: '24px', fontSize: '16px'}}>
            Je wijzigingen zijn opgeslagen en worden opnieuw beoordeeld door de admin.
          </p>
          <a className="btn btn-primary" href="#/my-requests">Terug naar mijn inschrijvingen</a>
        </div>
      </div>
    );
  }

  return (
    <div className="Register">
      <h2>✏️ Inschrijving bewerken</h2>
      <form className="Form" onSubmit={save}>
        <div className="Form__grid">
          {['parentName','parentPhone','parentEmail','studentName','studentAge','studentLeerjaar','studentStudierichting'].map((key) => (
            <label key={key}>
              <span>{fieldLabels[key]} *</span>
              <input 
                name={key} 
                value={form[key] || ''} 
                onChange={handleChange} 
                required
                type={key === 'studentAge' ? 'number' : key === 'parentEmail' ? 'email' : 'text'}
                min={key === 'studentAge' ? '12' : undefined}
                max={key === 'studentAge' ? '18' : undefined}
              />
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
          <h3>📅 Pas je lesblokken aan</h3>
          <p className="hint">
            <strong>💡 Tip:</strong> Klik op beschikbare tijdstippen om ze te selecteren. 
            Je kunt meerdere uren selecteren, maar maximaal 2 per dag.
          </p>
          {selectedSlots.length > 0 && (
            <div style={{
              background: 'rgba(16,185,129,0.1)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              border: '2px solid rgba(16,185,129,0.3)'
            }}>
              <strong>✓ {selectedSlots.length} tijdstip{selectedSlots.length !== 1 ? 'pen' : ''} geselecteerd</strong>
            </div>
          )}
          <Calendar
            availability={availability}
            selectedSlots={selectedSlots}
            onChangeSelected={setSelectedSlots}
            readOnly={false}
          />
        </div>
        <div className="Form__actions">
          <button className="btn" type="button" onClick={() => window.location.hash = '#/my-requests'}>
            Annuleren
          </button>
          <button className="btn btn-primary" disabled={!canSubmit} type="submit">
            {canSubmit ? 'Opslaan ✨' : 'Selecteer minimaal 1 tijdstip'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditRegistration;


