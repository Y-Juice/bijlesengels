import React, { useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiEdit2, FiCalendar, FiInfo, FiCheck } from 'react-icons/fi';
import '../styles/Register.css';
import Calendar from '../shared/Calendar';
import {
  getAvailability,
  getRegistrations,
  updateRegistration,
  getCurrentUserFromStorage,
} from '../services/storage';
import {
  bookingSelectionsToStoredSlots,
  parseInstanceKey,
  storedSlotsToBookingState,
  formatLocalDateString,
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

function parseId() {
  const hash = window.location.hash;
  const parts = hash.split('/');
  return parts[2] || '';
}

function EditRegistration() {
  const [availability, setAvailability] = useState({});
  const [reg, setReg] = useState(null);
  const [form, setForm] = useState({});
  const [selectedSlotKeys, setSelectedSlotKeys] = useState([]);
  const [repeatByKey, setRepeatByKey] = useState({});
  const [allRegs, setAllRegs] = useState([]);
  const [saved, setSaved] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUserFromStorage();
      if (!user) {
        window.location.hash = '#/home';
        return;
      }
      const admin = user.role === 'admin';
      setIsAdmin(admin);
      setAvailability(await getAvailability());
      const regs = await getRegistrations();
      setAllRegs(regs);
      const id = parseId();
      // admin may edit any registration, a parent only their own
      const found = (regs || []).find((r) => r.id === id && (admin || r.userId === user.id));
      if (!found) {
        window.location.hash = admin ? '#/approve' : '#/my-requests';
        return;
      }
      setReg(found);
      setForm({
        parentName: found.parentName,
        parentPhone: found.parentPhone,
        parentEmail: found.parentEmail,
        studentName: found.studentName,
        studentAge: found.studentAge,
        studentLeerjaar: found.studentLeerjaar,
        studentStudierichting: found.studentStudierichting,
        moreKids: found.moreKids,
      });
      const { keys, repeatByKey: rb } = storedSlotsToBookingState(
        found.slots,
        formatLocalDateString(),
        21
      );
      setSelectedSlotKeys(keys);
      setRepeatByKey(rb);
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

  const canSubmit = useMemo(() => reg && selectedSlotKeys.length > 0, [reg, selectedSlotKeys]);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = (e) => {
    e.preventDefault();
    if (!reg) return;
    (async () => {
      await updateRegistration(reg.id, {
        ...form,
        slots: bookingSelectionsToStoredSlots(selectedSlotKeys, repeatByKey),
      });
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
    studentStudierichting: 'Studierichting',
  };

  if (!reg) return null;
  if (saved) {
    return (
      <div className="Register">
        <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <FiCheckCircle
            style={{ fontSize: '4rem', marginBottom: '16px', color: 'var(--color-palm)' }}
            aria-hidden="true"
          />
          <h2>Inschrijving bijgewerkt!</h2>
          <p style={{ marginTop: '12px', marginBottom: '24px', fontSize: '16px' }}>
            {isAdmin
              ? 'De wijzigingen zijn opgeslagen. De inschrijving staat opnieuw op "in afwachting".'
              : 'Je wijzigingen zijn opgeslagen en worden opnieuw beoordeeld door de admin.'}
          </p>
          <a className="btn btn-primary" href={isAdmin ? '#/approve' : '#/my-requests'}>
            {isAdmin ? 'Terug naar reserveringen' : 'Terug naar mijn inschrijvingen'}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="Register">
      <h2 className="Register__sectionTitle">
        <FiEdit2 aria-hidden="true" />
        <span>Inschrijving bewerken</span>
      </h2>
      <form className="Form" onSubmit={save}>
        <div className="Form__grid">
          {['parentName', 'parentPhone', 'parentEmail', 'studentName', 'studentAge', 'studentLeerjaar', 'studentStudierichting'].map((key) => (
            <label key={key}>
              <span>{fieldLabels[key]} *</span>
              <input
                name={key}
                value={form[key] || ''}
                onChange={handleChange}
                required
                type={
                  key === 'studentAge' ? 'number' : key === 'parentEmail' ? 'email' : 'text'
                }
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
          <h3 className="Register__sectionTitle">
            <FiCalendar aria-hidden="true" />
            <span>Pas je lesblokken aan</span>
          </h3>
          <p className="hint">
            <FiInfo className="hint__icon" aria-hidden="true" />
            <span>
              <strong>Tip:</strong> Per kalenderdatum een uur kiezen; standaard alleen die datum,
              tenzij je hieronder herhaling instelt. Maximaal 2 tijdstippen per kalenderdag.
            </span>
          </p>
          {selectedSlotKeys.length > 0 && (
            <div
              style={{
                background: 'rgba(16,185,129,0.1)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                border: '2px solid rgba(16,185,129,0.3)',
              }}
            >
              <FiCheck aria-hidden="true" style={{ marginRight: '8px', verticalAlign: '-2px' }} />
              <strong>
                {selectedSlotKeys.length} tijdstip{selectedSlotKeys.length !== 1 ? 'pen' : ''}{' '}
                geselecteerd
              </strong>
            </div>
          )}
          <Calendar
            availability={availability}
            registrations={allRegs}
            selectedSlots={selectedSlotKeys}
            onChangeSelected={onBookingKeysChange}
            readOnly={false}
            bookingPickMode
            ignoreRegistrationIds={[reg.id]}
          />
          {selectedSlotKeys.length > 0 && (
            <div className="BookingRepeatList">
              <h4 className="BookingRepeatList__title">Herhaling per tijdstip</h4>
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
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        <div className="Form__actions">
          <button className="btn" type="button" onClick={() => (window.location.hash = isAdmin ? '#/approve' : '#/my-requests')}>
            Annuleren
          </button>
          <button className="btn btn-primary" disabled={!canSubmit} type="submit">
            {canSubmit ? 'Opslaan' : 'Selecteer minimaal 1 tijdstip'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditRegistration;
