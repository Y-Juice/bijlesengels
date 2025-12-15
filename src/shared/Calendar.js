import React, { useMemo, useState } from 'react';
import '../styles/Calendar.css';

const DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const HOURS = Array.from({ length: 10 }).map((_, i) => 9 + i); // 09:00 - 18:00

function slotId(dayIdx, hour) {
  return `${dayIdx}-${hour}`; // e.g. 1-9 for Tuesday 09:00
}
function slotDay(id) {
  return String(id).split('-')[0];
}

// convert JS getDay() to our Monday-based index (0 = Monday)
function weekdayIndexFromDate(d) {
  return (d.getDay() + 6) % 7;
}

function Calendar({
  availability = {},
  registrations = [],
  selectedSlots = [],
  onChangeSelected = () => {},
  onToggleAvailability,
  readOnly,
  adminEdit,
  maxSelect,
  maxPerDay = 2,
  daysToShow = 14
}) {
  const [hover, setHover] = useState(null);
  const [modalRegs, setModalRegs] = useState(null);

  const regsBySlot = useMemo(() => {
    const map = {};
    (registrations || []).forEach((r) => {
      (r.slots || []).forEach((s) => {
        map[s] = map[s] || [];
        map[s].push(r);
      });
    });
    return map;
  }, [registrations]);

  const isAvailable = (id) => availability[id] === 'available';
  const isOccupied = (id) => availability[id] === 'occupied' || (regsBySlot[id] || []).some((r) => r.status === 'approved');
  const hasAnyRegistration = (id) => (regsBySlot[id] || []).length > 0;

  const handleClick = (id, dateStr) => {
    // if there are registrations for this slot, open the modal to show details
    if (hasAnyRegistration(id)) {
      setModalRegs({ id, regs: regsBySlot[id], date: dateStr });
      return;
    }

    if (adminEdit && onToggleAvailability) {
      onToggleAvailability([id]);
      return;
    }

    if (readOnly || isOccupied(id) || !isAvailable(id)) return;
    const exists = selectedSlots.includes(id);
    let next;
    if (exists) {
      next = selectedSlots.filter((s) => s !== id);
    } else {
      // enforce per-day limit
      const day = slotDay(id);
      const perDayCount = selectedSlots.filter((s) => slotDay(s) === day).length;
      if (perDayCount >= maxPerDay) return;
      next = [...selectedSlots, id];
    }
    if (typeof maxSelect === 'number' && maxSelect > 0 && next.length > maxSelect) next = next.slice(0, maxSelect);
    onChangeSelected(next);
  };

  // generate list of actual upcoming dates
  const days = useMemo(() => {
    const out = [];
    const today = new Date();
    for (let i = 0; i < daysToShow; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      out.push(d);
    }
    return out;
  }, [daysToShow]);

  return (
    <div className="Calendar Calendar--agenda">
      <div className="Calendar__agenda">
        {days.map((d) => {
          const weekdayIdx = weekdayIndexFromDate(d);
          const dateStr = d.toISOString().slice(0, 10);
          return (
            <div key={dateStr} className="Calendar__day">
              <div className="Calendar__dayHeader">
                <div className="Calendar__dayLabel">{DAYS[weekdayIdx]} {dateStr}</div>
              </div>
              <div className="Calendar__daySlots">
                {HOURS.map((h) => {
                  const id = slotId(weekdayIdx, h);
                  const classes = ['Calendar__slot', 'Calendar__slot--agenda'];
                  if (isAvailable(id)) classes.push('available');
                  else classes.push('unavailable');
                  if (isOccupied(id)) classes.push('occupied');
                  if (selectedSlots.includes(id)) classes.push('selected');
                  if (hover === id) classes.push('hover');
                  return (
                    <button
                      key={`${dateStr}-${h}`}
                      className={classes.join(' ')}
                      onClick={() => handleClick(id, dateStr)}
                      onMouseEnter={() => setHover(id)}
                      onMouseLeave={() => setHover(null)}
                      aria-label={`${dateStr} ${h}:00`}
                    >
                      <span className="Calendar__slotTime">{String(h).padStart(2, '0')}:00</span>
                      {hasAnyRegistration(id) && <span className="Calendar__slotBadge">{(regsBySlot[id] || []).length}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="Calendar__legend">
        <span className="dot available" /> Beschikbaar
        <span className="dot unavailable" /> Niet beschikbaar
        <span className="dot occupied" /> Bezet (goedgekeurd)
        <span className="dot pending" /> In afwachting
        <span className="dot selected" /> Geselecteerd
      </div>

      {modalRegs && (
        <div className="Calendar__modalOverlay" onClick={() => setModalRegs(null)}>
          <div className="Calendar__modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reserveringen voor {modalRegs.date} ({modalRegs.id})</h3>
            {modalRegs.regs.map((r) => (
              <div key={r.id} className="Calendar__reg">
                <div><strong>Inschrijving:</strong> {r.id}</div>
                <div><strong>Status:</strong> {r.status}</div>
                <div><strong>Ouder:</strong> {r.parentName} ({r.parentPhone || ''})</div>
                <div><strong>Email:</strong> {r.parentEmail}</div>
                <div><strong>Leerling:</strong> {r.studentName}, {r.studentAge} jaar, {r.studentLeerjaar} - {r.studentStudierichting}</div>
                <div><strong>Geselecteerde slots:</strong> {(r.slots || []).join(', ')}</div>
                <div><strong>Aangemaakt:</strong> {r.createdAt ? new Date(r.createdAt).toLocaleString() : 'n.v.t.'}</div>
              </div>
            ))}
            <div className="Calendar__modalActions">
              <button className="btn" onClick={() => setModalRegs(null)}>Sluiten</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;


