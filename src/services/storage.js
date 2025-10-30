const USERS_KEY = 'be_users';
const SESSION_KEY = 'be_session';
const AVAILABILITY_KEY = 'be_availability';
const REGISTRATIONS_KEY = 'be_registrations';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedAdminIfMissing() {
  const users = read(USERS_KEY, []);
  if (!users.find((u) => u.role === 'admin')) {
    users.push({ id: 'admin', username: 'admin', password: 'admin', role: 'admin', name: 'Admin' });
    write(USERS_KEY, users);
  }
}

export function getCurrentUserFromStorage() {
  seedAdminIfMissing();
  return read(SESSION_KEY, null);
}

export function login(username, password) {
  seedAdminIfMissing();
  const users = read(USERS_KEY, []);
  const found = users.find((u) => u.username === username && u.password === password);
  if (!found) return false;
  write(SESSION_KEY, found);
  return true;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function registerUser(user) {
  const users = read(USERS_KEY, []);
  if (users.find((u) => u.username === user.username)) return false;
  const newUser = { ...user, id: `u_${Date.now()}` };
  users.push(newUser);
  write(USERS_KEY, users);
  return true;
}

export function getAvailability() {
  return read(AVAILABILITY_KEY, {});
}

export function setAvailability(av) {
  write(AVAILABILITY_KEY, av);
}

export function occupySlots(slots) {
  // mark selected slots as occupied
  const av = getAvailability();
  slots.forEach((id) => {
    av[id] = 'occupied';
  });
  setAvailability(av);
}

export function freeSlots(slots) {
  const av = getAvailability();
  slots.forEach((id) => {
    if (av[id] === 'occupied') {
      av[id] = 'available';
    }
  });
  setAvailability(av);
}

export function getRegistrations() {
  return read(REGISTRATIONS_KEY, []);
}

export function addRegistration(reg) {
  const regs = getRegistrations();
  const withId = { ...reg, id: `r_${Date.now()}` };
  regs.push(withId);
  write(REGISTRATIONS_KEY, regs);
  return withId.id;
}

export function updateRegistrationStatus(id, status) {
  const regs = getRegistrations();
  const idx = regs.findIndex((r) => r.id === id);
  if (idx >= 0) {
    regs[idx].status = status;
    write(REGISTRATIONS_KEY, regs);
    if (status === 'approved') occupySlots(regs[idx].slots);
  }
}

export function getUserRegistrations(userId) {
  return getRegistrations().filter((r) => r.userId === userId);
}

export function updateRegistration(id, change) {
  const regs = getRegistrations();
  const idx = regs.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  // if previously approved and slots are changing or cancellation to pending, free old slots
  const prev = regs[idx];
  if (prev.status === 'approved' && change.slots) {
    freeSlots(prev.slots || []);
  }
  regs[idx] = { ...prev, ...change, status: 'pending' };
  write(REGISTRATIONS_KEY, regs);
  return true;
}

export function deleteRegistration(id) {
  const regs = getRegistrations();
  const idx = regs.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  const prev = regs[idx];
  if (prev.status === 'approved') freeSlots(prev.slots || []);
  regs.splice(idx, 1);
  write(REGISTRATIONS_KEY, regs);
  return true;
}


