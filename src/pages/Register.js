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

function Register({ currentUser, onAuthChange }) {
  const [form, setForm] = useState(initialForm);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [availability, setAvailability] = useState({});
  const [sent, setSent] = useState(false);

  useEffect(() => {
    async function load() {
      setAvailability(await getAvailability());
    }
    load();
  }, []);

  // Check and sync user state
  useEffect(() => {
    if (!currentUser) {
      const checkUser = async () => {
        const user = await getCurrentUserFromStorage();
        if (user && onAuthChange) {
          onAuthChange(user);
        }
      };
      checkUser();
    }
  }, [currentUser, onAuthChange]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const canSubmit = useMemo(() => {
    return (
      form.parentName && form.parentPhone && form.parentEmail && form.studentName &&
      form.studentAge && form.studentLeerjaar && form.studentStudierichting &&
      selectedSlots.length > 0
    );
  }, [form, selectedSlots]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Prevent form submission - we'll use the sticky button instead
  };

  const handleRegister = async () => {
    // Use currentUser prop first, fallback to checking storage
    let user = currentUser;
    if (!user) {
      user = await getCurrentUserFromStorage();
      if (onAuthChange) {
        onAuthChange(user);
      }
    }
    
    if (!user) {
      alert('Log in of registreer eerst om te kunnen inschrijven. Klik op "Log in / Registreer" in de header.');
      return;
    }
    
    if (!canSubmit) {
      alert('Vul alle verplichte velden in en selecteer minimaal één tijdstip.');
      return;
    }
    
    await addRegistration({
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
        <div className="card" style={{textAlign: 'center', padding: '48px 32px'}}>
          <div style={{fontSize: '4rem', marginBottom: '16px'}}>🎉</div>
          <h2>Inschrijving verzonden!</h2>
          <p style={{marginTop: '12px', marginBottom: '24px', fontSize: '16px'}}>
            Je aanvraag is ingediend en verschijnt op de goedkeuringspagina voor de admin. 
            Je ontvangt een bevestiging zodra je inschrijving is goedgekeurd.
          </p>
          <a className="btn btn-primary" href="#/home">Terug naar Home</a>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    return (
      <div className="Register">
        <div className="card" style={{
          textAlign: 'center',
          padding: '48px 32px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(236,72,153,0.1) 100%)',
          border: '2px solid var(--color-primary-light)'
        }}>
          <div style={{fontSize: '4rem', marginBottom: '16px'}}>🔐</div>
          <h2>Inloggen vereist</h2>
          <p style={{marginTop: '12px', marginBottom: '24px', fontSize: '16px'}}>
            Je moet ingelogd zijn om een inschrijving te kunnen doen. 
            Klik op de knop "Log in / Registreer" in de header om in te loggen of een account aan te maken.
          </p>
          <a className="btn btn-primary" href="#/home">
            Terug naar Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="Register">
        <h2>Inschrijfformulier</h2>
        <form className="Form" onSubmit={handleSubmit}>
          <div className="Form__grid">
          <label>
            <span>Naam ouder/voogd *</span>
            <input 
              name="parentName" 
              value={form.parentName} 
              onChange={handleChange} 
              placeholder="Jan Janssen"
              required 
            />
          </label>
          <label>
            <span>Telefoon ouder/voogd *</span>
            <input 
              name="parentPhone" 
              value={form.parentPhone} 
              onChange={handleChange}
              placeholder="+32 123 45 67 89"
              required 
            />
          </label>
          <label>
            <span>E-mail ouder/voogd *</span>
            <input 
              type="email" 
              name="parentEmail" 
              value={form.parentEmail} 
              onChange={handleChange}
              placeholder="jan@voorbeeld.nl"
              required 
            />
          </label>
          <label>
            <span>Naam leerling *</span>
            <input 
              name="studentName" 
              value={form.studentName} 
              onChange={handleChange}
              placeholder="Piet Janssen"
              required 
            />
          </label>
          <label>
            <span>Leeftijd leerling *</span>
            <input 
              name="studentAge" 
              type="number"
              min="12"
              max="18"
              value={form.studentAge} 
              onChange={handleChange}
              placeholder="15"
              required 
            />
          </label>
          <label>
            <span>Leerjaar *</span>
            <input 
              name="studentLeerjaar" 
              value={form.studentLeerjaar} 
              onChange={handleChange}
              placeholder="1ste secundair"
              required 
            />
          </label>
          <label>
            <span>Studierichting *</span>
            <input 
              name="studentStudierichting" 
              value={form.studentStudierichting} 
              onChange={handleChange}
              placeholder="ASO"
              required 
            />
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
          <h3>📅 Kies je lesblokken</h3>
          <p className="hint">
            <strong>💡 Tip:</strong> Klik op beschikbare tijdstippen om ze te selecteren. 
            Je kunt meerdere uren selecteren, maar maximaal 2 per dag. 
            Groen = beschikbaar, rood = bezet, grijs = niet beschikbaar.
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
      </form>
      </div>
      
      {/* Sticky register button */}
      <div className="Register__stickyButton">
        <button 
          className="btn btn-primary Register__submitBtn" 
          disabled={!canSubmit} 
          onClick={handleRegister}
        >
          {canSubmit ? '📝 Schrijf in' : 'Vul alle velden in'}
        </button>
      </div>
    </>
  );
}

export default Register;


