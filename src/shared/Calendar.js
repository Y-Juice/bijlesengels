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

function Calendar({
  availability = {},
  selectedSlots = [],
  onChangeSelected = () => {},
  onToggleAvailability,
  readOnly,
  adminEdit,
  maxSelect,
  maxPerDay = 2
}) {
  const [hover, setHover] = useState(null);

  const isAvailable = (id) => availability[id] === 'available';
  const isOccupied = (id) => availability[id] === 'occupied';

  const handleClick = (id) => {
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

  const grid = useMemo(() => {
    return DAYS.map((d, di) => ({
      label: d,
      hours: HOURS.map((h) => {
        const id = slotId(di, h);
        return { id, hour: h };
      })
    }));
  }, []);

  return (
    <div className="Calendar">
      <div className="Calendar__header">
        <div className="Calendar__cell Calendar__cell--time" />
        {DAYS.map((d) => (
          <div key={d} className="Calendar__cell Calendar__cell--head">{d}</div>
        ))}
      </div>
      {HOURS.map((h) => (
        <div key={h} className="Calendar__row">
          <div className="Calendar__cell Calendar__cell--time">{`${String(h).padStart(2, '0')}:00`}</div>
          {DAYS.map((_, di) => {
            const id = slotId(di, h);
            const classes = ['Calendar__cell', 'Calendar__slot'];
            if (isAvailable(id)) classes.push('available');
            else classes.push('unavailable');
            if (isOccupied(id)) classes.push('occupied');
            if (selectedSlots.includes(id)) classes.push('selected');
            if (hover === id) classes.push('hover');
            return (
              <button
                key={id}
                className={classes.join(' ')}
                onClick={() => handleClick(id)}
                onMouseEnter={() => setHover(id)}
                onMouseLeave={() => setHover(null)}
                aria-label={id}
              />
            );
          })}
        </div>
      ))}
      <div className="Calendar__legend">
        <span className="dot available" /> Beschikbaar
        <span className="dot unavailable" /> Niet beschikbaar
        <span className="dot occupied" /> Bezet
        <span className="dot selected" /> Geselecteerd
      </div>
    </div>
  );
}

export default Calendar;


