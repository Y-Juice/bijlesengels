import React, { useMemo, useState } from 'react';
import '../styles/Calendar.css';
import { instanceKey, registrationBlocksCell, formatSlotsDisplay, formatHour, templateSlotKeyForDateHour } from '../utils/slots';

const DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const HOURS = Array.from({ length: 10 }).map((_, i) => 9 + i); // 09:00 - 18:00

/** Admin availability template id (weekday index Monday=0 … Sunday=6, plus hour). */
function slotId(dayIdx, hour) {
  return `${dayIdx}-${hour}`;
}

function slotDayPart(key, bookingPickMode) {
  if (bookingPickMode) return String(key).split('|')[0];
  return String(key).split('-')[0];
}

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
  daysToShow = 14,
  onlyAvailable = false,
  bookingPickMode = false,
  ignoreRegistrationIds = [],
}) {
  const [hover, setHover] = useState(null);
  const [modalRegs, setModalRegs] = useState(null);

  const blockOpts = useMemo(() => ({ ignoreRegistrationIds }), [ignoreRegistrationIds]);

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

  const regsBySlot = useMemo(() => {
    const map = {};
    (registrations || []).forEach((r) => {
      (r.slots || []).forEach((s) => {
        if (typeof s === 'string') {
          map[s] = map[s] || [];
          map[s].push(r);
        } else if (s && typeof s === 'object' && s.date != null && s.hour != null) {
          const tmpl = templateSlotKeyForDateHour(s.date, s.hour);
          map[tmpl] = map[tmpl] || [];
          if (!map[tmpl].some((x) => x.id === r.id)) map[tmpl].push(r);
        }
      });
    });
    return map;
  }, [registrations]);

  const isAvailableTemplate = (tmplId) => availability[tmplId] === 'available';

  const isOccupiedTemplate = (tmplId) =>
    availability[tmplId] === 'occupied' ||
    (regsBySlot[tmplId] || []).some((r) => r.status === 'approved');

  function regsAtCellBooking(dateStr, hour) {
    return (registrations || []).filter((r) =>
      registrationBlocksCell(r, dateStr, hour, blockOpts)
    );
  }

  function regsAtCellClassic(tmplId) {
    return regsBySlot[tmplId] || [];
  }

  function bookingCellBlocked(dateStr, hour, tmplId) {
    if (availability[tmplId] === 'occupied') return true;
    if (availability[tmplId] !== 'available') return true;
    return (registrations || []).some((r) =>
      registrationBlocksCell(r, dateStr, hour, blockOpts)
    );
  }

  const handleClick = (cellId, tmplId, dateStr, hourNum) => {
    const modalRegsList = bookingPickMode
      ? regsAtCellBooking(dateStr, hourNum)
      : regsAtCellClassic(tmplId);

    if (modalRegsList.length > 0) {
      setModalRegs({ id: cellId, regs: modalRegsList, date: dateStr, hour: hourNum });
      return;
    }

    if (adminEdit && onToggleAvailability) {
      onToggleAvailability([tmplId]);
      return;
    }

    if (bookingPickMode) {
      if (readOnly || bookingCellBlocked(dateStr, hourNum, tmplId)) return;
    } else if (readOnly || isOccupiedTemplate(tmplId) || !isAvailableTemplate(tmplId)) {
      return;
    }

    const exists = selectedSlots.includes(cellId);
    let next;
    if (exists) {
      next = selectedSlots.filter((s) => s !== cellId);
    } else {
      const dayKey = slotDayPart(cellId, bookingPickMode);
      const perDayCount = selectedSlots.filter((s) => slotDayPart(s, bookingPickMode) === dayKey).length;
      if (perDayCount >= maxPerDay) return;
      next = [...selectedSlots, cellId];
    }
    if (typeof maxSelect === 'number' && maxSelect > 0 && next.length > maxSelect) next = next.slice(0, maxSelect);
    onChangeSelected(next);
  };

  return (
    <div className="Calendar Calendar--agenda">
      <div className="Calendar__agenda">
        {days.map((d) => {
          const weekdayIdx = weekdayIndexFromDate(d);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const da = String(d.getDate()).padStart(2, '0');
          const dateStr = `${y}-${m}-${da}`;
          const hoursForDay = onlyAvailable
            ? HOURS.filter((h) => {
                const tmpl = slotId(weekdayIdx, h);
                if (!isAvailableTemplate(tmpl)) return false;
                if (bookingPickMode) return availability[tmpl] !== 'occupied';
                return !isOccupiedTemplate(tmpl);
              })
            : HOURS;
          if (onlyAvailable && hoursForDay.length === 0) {
            return null;
          }
          return (
            <div key={dateStr} className="Calendar__day">
              <div className="Calendar__dayHeader">
                <div className="Calendar__dayLabel">{DAYS[weekdayIdx]} {dateStr}</div>
              </div>
              <div className="Calendar__daySlots">
                {hoursForDay.map((h) => {
                  const tmplId = slotId(weekdayIdx, h);
                  const cellId = bookingPickMode ? instanceKey(dateStr, h) : tmplId;
                  const classes = ['Calendar__slot', 'Calendar__slot--agenda'];
                  const availOk = isAvailableTemplate(tmplId);
                  if (availOk) classes.push('available');
                  else classes.push('unavailable');

                  let occupiedCls = false;
                  let regsForBadge = [];
                  if (bookingPickMode) {
                    regsForBadge = regsAtCellBooking(dateStr, h);
                    occupiedCls =
                      availability[tmplId] === 'occupied' ||
                      regsForBadge.some((r) => r.status === 'approved');
                  } else {
                    regsForBadge = regsAtCellClassic(tmplId);
                    occupiedCls = isOccupiedTemplate(tmplId);
                  }

                  if (occupiedCls) classes.push('occupied');
                  if (selectedSlots.includes(cellId)) classes.push('selected');
                  if (hover === cellId) classes.push('hover');
                  return (
                    <button
                      type="button"
                      key={`${dateStr}-${h}`}
                      className={classes.join(' ')}
                      onClick={() => handleClick(cellId, tmplId, dateStr, h)}
                      onMouseEnter={() => setHover(cellId)}
                      onMouseLeave={() => setHover(null)}
                      aria-label={`${dateStr} ${h}:00`}
                    >
                      <span className="Calendar__slotTime">{String(h).padStart(2, '0')}:00</span>
                      {regsForBadge.length > 0 && (
                        <span className="Calendar__slotBadge">{regsForBadge.length}</span>
                      )}
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
            <h3>Reserveringen voor {modalRegs.date} om {formatHour(modalRegs.hour)}</h3>
            {modalRegs.regs.map((r) => (
              <div key={r.id} className="Calendar__reg">
                <div><strong>Inschrijving:</strong> {r.id}</div>
                <div><strong>Status:</strong> {r.status}</div>
                <div><strong>Ouder:</strong> {r.parentName} ({r.parentPhone || ''})</div>
                <div><strong>Email:</strong> {r.parentEmail}</div>
                <div><strong>Leerling:</strong> {r.studentName}, {r.studentAge} jaar, {r.studentLeerjaar} - {r.studentStudierichting}</div>
                <div><strong>Tijdstippen:</strong> {formatSlotsDisplay(r.slots)}</div>
                <div><strong>Aangemaakt:</strong> {r.createdAt ? new Date(r.createdAt).toLocaleString() : 'n.v.t.'}</div>
              </div>
            ))}
            <div className="Calendar__modalActions">
              <button type="button" className="btn" onClick={() => setModalRegs(null)}>Sluiten</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
