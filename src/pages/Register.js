import React, { useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiLock, FiCalendar, FiInfo, FiCheck, FiEdit3 } from 'react-icons/fi';
import '../styles/Register.css';
import Calendar from '../shared/Calendar';
import { getAvailability, addRegistration, getCurrentUserFromStorage, getRegistrations } from '../services/storage';
import {
  bookingSelectionsToStoredSlots,
  parseInstanceKey,
  REPEAT_NONE,
  REPEAT_WEEKLY,
  REPEAT_BIWEEKLY,
  REPEAT_MONTHLY,
} from '../utils/slots';

const REPEAT_OPTIONS = [
  { value: REPEAT_NONE, label: 'Alleen deze datum' },
  { value: REPEAT_WEEKLY, label: 'Elke week' },
  { value: REPEAT_BIWEEKLY, label: 'Om de twee weken' },
  { value: REPEAT_MONTHLY, label: 'Elke maand (zelfde dag)' },
];

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
  const [selectedSlotKeys, setSelectedSlotKeys] = useState([]);
  const [repeatByKey, setRepeatByKey] = useState({});
  const [availability, setAvailability] = useState({});
  const [allRegs, setAllRegs] = useState([]);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    async function load() {
      setAvailability(await getAvailability());
      setAllRegs(await getRegistrations());
    }
    load();
  }, []);

  const onBookingKeysChange = (keys) => {
    setSelectedSlotKeys(keys);
    setRepeatByKey((prev) => {
      const next = { ...prev };
      keys.forEach((k) => {
        if (!(k in next)) next[k] = REPEAT_NONE;
      });
      Object.keys(next).forEach((k) => {
        if (!keys.includes(k)) delete next[k];
      });
      return next;
    });
  };

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
      selectedSlotKeys.length > 0
    );
  }, [form, selectedSlotKeys]);

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
      slots: bookingSelectionsToStoredSlots(selectedSlotKeys, repeatByKey),
      status: 'pending',
      createdAt: Date.now()
    });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="Register">
        <div className="card" style={{textAlign: 'center', padding: '48px 32px'}}>
          <FiCheckCircle style={{fontSize: '4rem', marginBottom: '16px', color: 'var(--color-palm)'}} aria-hidden="true" />
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
          <FiLock style={{fontSize: '4rem', marginBottom: '16px', color: 'var(--color-palm)'}} aria-hidden="true" />
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
            <span>Telefoon ouder/voogd *</span>
            <input
              type="tel"
              name="parentPhone"
              value={form.parentPhone}
              onChange={handleChange}
              placeholder="+32 …"
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
            <select 
              name="studentLeerjaar" 
              value={form.studentLeerjaar} 
              onChange={handleChange}
              required
            >
              <option value="">Kies leerjaar</option>
              <option value="1ste secundair">1ste secundair</option>
              <option value="2de secundair">2de secundair</option>
              <option value="3de secundair">3de secundair</option>
              <option value="4de secundair">4de secundair</option>
            </select>
          </label>
          <label>
            <span>Studierichting *</span>
            <select 
              name="studentStudierichting" 
              value={form.studentStudierichting} 
              onChange={handleChange}
              required
            >
              <option value="">Kies richting</option>
              <option value="ASO">ASO</option>
              <option value="TSO">TSO</option>
              <option value="BSO">BSO</option>
            </select>
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
          <h3 className="Register__sectionTitle">
            <FiCalendar aria-hidden="true" />
            <span>Kies je lesblokken</span>
          </h3>
          <p className="hint">
            <FiInfo className="hint__icon" aria-hidden="true" />
            <span>
              <strong>Tip:</strong> Hieronder zie je alleen de tijdstippen die de host
              als beschikbaar heeft ingesteld. Elk gekozen uur geldt voor die kalenderdatum,
              tenzij je hieronder een terugkerend patroon kiest.
              Maximaal 2 tijdstippen per kalenderdag.
            </span>
          </p>
          {selectedSlotKeys.length > 0 && (
            <div style={{
              background: 'rgba(16,185,129,0.1)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              border: '2px solid rgba(16,185,129,0.3)'
            }}>
              <FiCheck aria-hidden="true" style={{marginRight: '8px', verticalAlign: '-2px'}} />
              <strong>{selectedSlotKeys.length} tijdstip{selectedSlotKeys.length !== 1 ? 'pen' : ''} geselecteerd</strong>
            </div>
          )}
          <Calendar
            availability={availability}
            registrations={allRegs}
            selectedSlots={selectedSlotKeys}
            onChangeSelected={onBookingKeysChange}
            readOnly={false}
            onlyAvailable
            bookingPickMode
          />
          {selectedSlotKeys.length > 0 && (
            <div className="BookingRepeatList">
              <h4 className="BookingRepeatList__title">Herhaling per tijdstip</h4>
              <p className="hint BookingRepeatList__hint">
                Standaard telt elk gekozen uur alleen voor die datum.
                Je kunt per tijdstip kiezen voor wekelijks, om de twee weken of maandelijks (zelfde kalenderdag).
              </p>
              <ul className="BookingRepeatList__items">
                {selectedSlotKeys.map((k) => {
                  const { dateStr, hour } = parseInstanceKey(k);
                  return (
                    <li key={k} className="BookingRepeatList__item">
                      <span className="BookingRepeatList__when">
                        {dateStr} om {String(hour).padStart(2, '0')}:00
                      </span>
                      <select
                        className="BookingRepeatList__select"
                        value={repeatByKey[k] || REPEAT_NONE}
                        onChange={(e) =>
                          setRepeatByKey((prev) => ({ ...prev, [k]: e.target.value }))
                        }
                      >
                        {REPEAT_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </form>
      </div>
      
      {/* Sticky register button */}
      <div className="Register__stickyButton">
        <button 
          type="button"
          className="btn btn-primary Register__submitBtn" 
          disabled={!canSubmit} 
          onClick={handleRegister}
        >
          {canSubmit ? (
            <>
              <FiEdit3 aria-hidden="true" /> Schrijf in
            </>
          ) : (
            'Vul alle velden in'
          )}
        </button>
      </div>
    </>
  );
}

export default Register;


