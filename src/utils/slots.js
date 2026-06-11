/** Booking slots: concrete calendar occurrence + optional recurrence (stored as JSON objects).
 *  Legacy: "weekday-hour" string e.g. "5-10" (still supported for old rows). */

export const REPEAT_NONE = 'none';
export const REPEAT_WEEKLY = 'weekly';
export const REPEAT_BIWEEKLY = 'biweekly';
export const REPEAT_MONTHLY = 'monthly';

export function normalizeRepeat(r) {
  if (!r || r === REPEAT_NONE) return REPEAT_NONE;
  if ([REPEAT_WEEKLY, REPEAT_BIWEEKLY, REPEAT_MONTHLY].includes(r)) return r;
  return REPEAT_NONE;
}

/** weekday-hour template key used by admin availability (0 = Monday … 6 = Sunday) */
export function isLegacyTemplateSlot(s) {
  return typeof s === 'string' && /^\d-\d{1,2}$/.test(s);
}

export function formatLocalDateString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

export function weekdayIndexFromLocalDateStr(dateStr) {
  const [y, mo, da] = dateStr.split('-').map(Number);
  const d = new Date(y, mo - 1, da);
  return (d.getDay() + 6) % 7;
}

export function templateSlotKeyForDateHour(dateStr, hour) {
  return `${weekdayIndexFromLocalDateStr(dateStr)}-${hour}`;
}

export function instanceKey(dateStr, hour) {
  return `${dateStr}|${hour}`;
}

export function parseInstanceKey(key) {
  const idx = String(key).lastIndexOf('|');
  return { dateStr: key.slice(0, idx), hour: Number(key.slice(idx + 1)) };
}

function wholeWeeksBetween(anchorStr, bStr) {
  const a = new Date(anchorStr + 'T12:00:00');
  const b = new Date(bStr + 'T12:00:00');
  return Math.round((b - a) / (7 * 24 * 60 * 60 * 1000));
}

function monthlyOccurrenceMatches(anchorStr, candStr) {
  const anchor = new Date(anchorStr + 'T12:00:00');
  const cand = new Date(candStr + 'T12:00:00');
  if (cand < anchor) return false;
  return cand.getDate() === anchor.getDate();
}

export function slotCoversCalendarCell(entry, dateStr, hour, horizonOpts = {}) {
  const h = Number(hour);
  if (typeof entry === 'string') {
    if (!isLegacyTemplateSlot(entry)) return false;
    const [wd, hh] = entry.split('-').map(Number);
    return weekdayIndexFromLocalDateStr(dateStr) === wd && h === hh;
  }
  if (!entry || typeof entry !== 'object') return false;
  const eh = Number(entry.hour);
  if (eh !== h || entry.date == null) return false;
  const anchor = entry.date;
  const repeat = normalizeRepeat(entry.repeat);
  if (repeat === REPEAT_NONE) return anchor === dateStr;

  const ignorePast = horizonOpts.ignorePastAnchor !== false;
  if (ignorePast && dateStr < anchor) return false;

  if (repeat === REPEAT_WEEKLY) {
    return (
      weekdayIndexFromLocalDateStr(dateStr) === weekdayIndexFromLocalDateStr(anchor) &&
      wholeWeeksBetween(anchor, dateStr) >= 0
    );
  }
  if (repeat === REPEAT_BIWEEKLY) {
    const w = wholeWeeksBetween(anchor, dateStr);
    return (
      weekdayIndexFromLocalDateStr(dateStr) === weekdayIndexFromLocalDateStr(anchor) &&
      w >= 0 &&
      w % 2 === 0
    );
  }
  if (repeat === REPEAT_MONTHLY) {
    return monthlyOccurrenceMatches(anchor, dateStr);
  }
  return false;
}

export function registrationBlocksCell(reg, dateStr, hour, opts = {}) {
  const { ignoreRegistrationIds } = opts;
  if (!reg || !['pending', 'approved'].includes(reg.status)) return false;
  if (ignoreRegistrationIds && ignoreRegistrationIds.includes(reg.id)) return false;
  return (reg.slots || []).some((s) => slotCoversCalendarCell(s, dateStr, hour));
}

export function filterLegacySlotsForAvailability(slots) {
  return (slots || []).filter((s) => typeof s === 'string' && isLegacyTemplateSlot(s));
}

const WEEKDAY_NAMES = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];

export function formatHour(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

export function formatSlotEntry(entry) {
  if (typeof entry === 'string') {
    if (isLegacyTemplateSlot(entry)) {
      const [wd, hh] = entry.split('-').map(Number);
      const dayName = WEEKDAY_NAMES[wd];
      return dayName ? `elke ${dayName} om ${formatHour(hh)}` : formatHour(hh);
    }
    return entry;
  }
  if (!entry || entry.date == null || entry.hour == null) return '';
  const tim = formatHour(entry.hour);
  const base = `${entry.date} ${tim}`;
  const rep = normalizeRepeat(entry.repeat);
  if (rep === REPEAT_NONE) return `${base} (eenmalig)`;
  if (rep === REPEAT_WEEKLY) return `${base} (elke week)`;
  if (rep === REPEAT_BIWEEKLY) return `${base} (om de twee weken)`;
  if (rep === REPEAT_MONTHLY) return `${base} (elke maand)`;
  return base;
}

export function formatSlotsDisplay(slots) {
  return (slots || []).map(formatSlotEntry).filter(Boolean).join('; ');
}

export function bookingSelectionsToStoredSlots(keys, repeatByKey) {
  return keys.map((k) => {
    const { dateStr, hour } = parseInstanceKey(k);
    return { date: dateStr, hour, repeat: normalizeRepeat(repeatByKey[k]) };
  });
}

function firstDateMatchingWeekdayOnOrAfter(startStr, weekdayIdx, maxDays) {
  const start = new Date(startStr + 'T12:00:00');
  for (let i = 0; i < maxDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (((d.getDay() + 6) % 7) === weekdayIdx) {
      return formatLocalDateString(d);
    }
  }
  return null;
}

/** Hydrate picker state from DB rows (legacy strings → inferred weekly anchor date). */
export function storedSlotsToBookingState(slots, horizonStartStr, horizonDays = 21) {
  const keys = [];
  const repeatByKey = {};
  for (const s of slots || []) {
    if (typeof s === 'string' && isLegacyTemplateSlot(s)) {
      const [wd, hour] = s.split('-').map(Number);
      const dateStr = firstDateMatchingWeekdayOnOrAfter(horizonStartStr, wd, horizonDays);
      if (!dateStr) continue;
      const k = instanceKey(dateStr, hour);
      if (!keys.includes(k)) keys.push(k);
      repeatByKey[k] = REPEAT_WEEKLY;
    } else if (s && typeof s === 'object' && s.date != null && s.hour != null) {
      const k = instanceKey(s.date, s.hour);
      if (!keys.includes(k)) keys.push(k);
      repeatByKey[k] = normalizeRepeat(s.repeat);
    }
  }
  return { keys, repeatByKey };
}
