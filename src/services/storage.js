import { createClient } from '@supabase/supabase-js';

const USERS_KEY = 'be_users';
const SESSION_KEY = 'be_session';
const AVAILABILITY_KEY = 'be_availability';

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

// Helper to ensure admin user exists in Supabase
async function ensureAdminExists() {
  if (!useSupabase) return;
  try {
    // Check if admin profile exists
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .limit(1)
      .maybeSingle();
    
    if (!adminProfile) {
      // Admin doesn't exist, try to create one
      // Note: This requires manual creation of admin user in Supabase Auth first
      console.warn('Admin user not found in profiles. Please create an admin user in Supabase Auth with email "admin@bijlesengels.be" and then create a profile with role="admin"');
    }
  } catch (e) {
    console.error('ensureAdminExists error', e);
  }
}

// Authentication helpers (Supabase Auth when available, localStorage fallback)
export async function getCurrentUserFromStorage() {
  // if supabase available, return merged profile
  if (useSupabase) {
    try {
      const { data: sessionData, error: sessErr } = await supabase.auth.getSession();
      if (sessErr || !sessionData?.data?.session) {
        await ensureAdminExists();
        return null;
      }
      const user = sessionData.data.session.user;
      // fetch profile from 'profiles' table
      const { data: profile, error: pErr } = await supabase.from('profiles').select('*').eq('id', user.id).limit(1).maybeSingle();
      if (pErr) {
        console.error('getCurrentUserFromStorage profile error', pErr);
        // still return basic user
        return { id: user.id, email: user.email };
      }
      return { id: user.id, email: user.email, ...profile };
    } catch (e) {
      console.error('getCurrentUserFromStorage supabase error', e);
      return null;
    }
  }
  seedAdminIfMissing();
  return read(SESSION_KEY, null);
}

export async function signIn(identifier, password) {
  // identifier can be email or username
  if (useSupabase) {
    try {
      let email = identifier;
      // if it doesn't look like an email, try resolving username -> email in profiles
      if (!identifier.includes('@')) {
        const { data: profs } = await supabase.from('profiles').select('id,email').eq('username', identifier).limit(1).maybeSingle();
        if (profs && profs.email) email = profs.email;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('supabase signIn error', error);
        return null;
      }
      const user = data.user;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).limit(1).maybeSingle();
      return { id: user.id, email: user.email, ...profile };
    } catch (e) {
      console.error('signIn supabase error', e);
      return null;
    }
  }
  // fallback local
  seedAdminIfMissing();
  const users = read(USERS_KEY, []);
  const found = users.find((u) => u.username === identifier && u.password === password) || users.find((u) => u.email === identifier && u.password === password);
  if (!found) return null;
  write(SESSION_KEY, found);
  return found;
}

export async function signUp(user) {
  if (useSupabase) {
    try {
      // create auth user
      const { data, error } = await supabase.auth.signUp({ email: user.email, password: user.password });
      if (error) { 
        console.error('supabase signUp error', error); 
        return null; 
      }
      const uid = data.user?.id || data?.user?.id;
      if (!uid) {
        console.error('No user ID returned from signUp');
        return null;
      }
      // insert profile row
      const profile = {
        id: uid,
        name: user.name,
        phone: user.phone,
        username: user.username,
        role: user.role || 'parent',
        email: user.email
      };
      const { error: pErr } = await supabase.from('profiles').insert([profile]);
      if (pErr) {
        console.error('supabase insert profile error', pErr);
        // Try to delete the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(uid).catch(() => {});
        return null;
      }
      return { id: uid, ...profile };
    } catch (e) {
      console.error('signUp supabase error', e);
      return null;
    }
  }
  // fallback local
  const users = read(USERS_KEY, []);
  if (users.find((u) => u.username === user.username)) return null;
  const newUser = { ...user, id: `u_${Date.now()}` };
  users.push(newUser);
  write(USERS_KEY, users);
  write(SESSION_KEY, newUser);
  return newUser;
}

export async function signOut() {
  if (useSupabase) {
    try {
      await supabase.auth.signOut();
      return true;
    } catch (e) {
      console.error('signOut supabase error', e);
      return false;
    }
  }
  localStorage.removeItem(SESSION_KEY);
  return true;
}

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;
const useSupabase = !!(SUPABASE_URL && SUPABASE_KEY);
let supabase = null;
if (useSupabase) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Availability stored in table `availability` with columns: slot (primary key), status
// Registrations stored in table `registrations` with columns matching the object fields,
// `slots` stored as jsonb/JSON.

export async function getAvailability() {
  if (!useSupabase) return read(AVAILABILITY_KEY, {});
  try {
    const { data, error } = await supabase.from('availability').select('*');
    if (error) {
      console.error('Supabase getAvailability error', error);
      return {};
    }
    const out = {};
    if (data) {
      data.forEach((r) => { out[r.slot] = r.status; });
    }
    return out;
  } catch (e) {
    console.error('getAvailability exception', e);
    return {};
  }
}

export async function setAvailability(av) {
  if (!useSupabase) { write(AVAILABILITY_KEY, av); return; }
  try {
    const rows = Object.keys(av).map((slot) => ({ slot, status: av[slot] }));
    const { error } = await supabase.from('availability').upsert(rows, { onConflict: 'slot' });
    if (error) {
      console.error('Supabase setAvailability error', error);
      throw error;
    }
  } catch (e) {
    console.error('setAvailability exception', e);
    throw e;
  }
}

export async function occupySlots(slots) {
  if (!useSupabase) {
    const av = read(AVAILABILITY_KEY, {});
    slots.forEach((id) => { av[id] = 'occupied'; });
    write(AVAILABILITY_KEY, av);
    return;
  }
  const rows = slots.map((slot) => ({ slot, status: 'occupied' }));
  const { error } = await supabase.from('availability').upsert(rows, { onConflict: 'slot' });
  if (error) console.error('Supabase occupySlots error', error);
}

export async function freeSlots(slots) {
  if (!useSupabase) {
    const av = read(AVAILABILITY_KEY, {});
    slots.forEach((id) => { if (av[id] === 'occupied') av[id] = 'available'; });
    write(AVAILABILITY_KEY, av);
    return;
  }
  // fetch current and update those that are occupied -> available
  const { data, error } = await supabase.from('availability').select('*').in('slot', slots);
  if (error) { console.error('Supabase freeSlots select error', error); return; }
  const updates = (data || []).map((r) => ({ slot: r.slot, status: r.status === 'occupied' ? 'available' : r.status }));
  if (updates.length > 0) {
    const { error: err2 } = await supabase.from('availability').upsert(updates, { onConflict: 'slot' });
    if (err2) console.error('Supabase freeSlots upsert error', err2);
  }
}

export async function getRegistrations() {
  if (!useSupabase) return read('be_registrations', []);
  try {
    const { data, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
    if (error) { 
      console.error('Supabase getRegistrations error', error); 
      return []; 
    }
    // Map database snake_case to JavaScript camelCase
    return (data || []).map((r) => ({ 
      id: r.id,
      userId: r.user_id,
      parentName: r.parent_name,
      parentPhone: r.parent_phone,
      parentEmail: r.parent_email,
      studentName: r.student_name,
      studentAge: r.student_age,
      studentLeerjaar: r.student_leerjaar,
      studentStudierichting: r.student_studierichting,
      moreKids: r.more_kids,
      slots: Array.isArray(r.slots) ? r.slots : (typeof r.slots === 'string' ? JSON.parse(r.slots) : []),
      status: r.status,
      createdAt: r.created_at
    }));
  } catch (e) {
    console.error('getRegistrations exception', e);
    return [];
  }
}

export async function addRegistration(reg) {
  if (!useSupabase) {
    const regs = read('be_registrations', []);
    const withId = { ...reg, id: `r_${Date.now()}` };
    regs.push(withId);
    write('be_registrations', regs);
    return withId.id;
  }
  try {
    const id = `r_${Date.now()}`;
    // Map JavaScript camelCase to database snake_case
    const payload = { 
      id,
      user_id: reg.userId,
      parent_name: reg.parentName,
      parent_phone: reg.parentPhone,
      parent_email: reg.parentEmail,
      student_name: reg.studentName,
      student_age: reg.studentAge,
      student_leerjaar: reg.studentLeerjaar,
      student_studierichting: reg.studentStudierichting,
      more_kids: reg.moreKids || 'no',
      slots: Array.isArray(reg.slots) ? reg.slots : [],
      status: reg.status || 'pending',
      created_at: reg.createdAt || Date.now()
    };
    const { error, data } = await supabase.from('registrations').insert([payload]).select();
    if (error) { 
      console.error('Supabase addRegistration error', error); 
      return null; 
    }
    return id;
  } catch (e) {
    console.error('addRegistration exception', e);
    return null;
  }
}

export async function updateRegistrationStatus(id, status) {
  if (!useSupabase) {
    const regs = read('be_registrations', []);
    const idx = regs.findIndex((r) => r.id === id);
    if (idx >= 0) {
      regs[idx].status = status;
      write('be_registrations', regs);
      if (status === 'approved') await occupySlots(regs[idx].slots || []);
    }
    return;
  }
  try {
    // fetch registration
    const { data, error } = await supabase.from('registrations').select('*').eq('id', id).limit(1).single();
    if (error) { 
      console.error('Supabase updateRegistrationStatus select error', error); 
      return; 
    }
    const { error: err2 } = await supabase.from('registrations').update({ status }).eq('id', id);
    if (err2) { 
      console.error('Supabase updateRegistrationStatus update error', err2); 
      return;
    }
    if (status === 'approved') {
      const slots = Array.isArray(data.slots) ? data.slots : (typeof data.slots === 'string' ? JSON.parse(data.slots) : []);
      await occupySlots(slots);
    }
  } catch (e) {
    console.error('updateRegistrationStatus exception', e);
  }
}

export async function getUserRegistrations(userId) {
  if (!useSupabase) return read('be_registrations', []).filter((r) => r.userId === userId);
  try {
    const { data, error } = await supabase.from('registrations').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) { 
      console.error('Supabase getUserRegistrations error', error); 
      return []; 
    }
    // Map database snake_case to JavaScript camelCase
    return (data || []).map((r) => ({ 
      id: r.id,
      userId: r.user_id,
      parentName: r.parent_name,
      parentPhone: r.parent_phone,
      parentEmail: r.parent_email,
      studentName: r.student_name,
      studentAge: r.student_age,
      studentLeerjaar: r.student_leerjaar,
      studentStudierichting: r.student_studierichting,
      moreKids: r.more_kids,
      slots: Array.isArray(r.slots) ? r.slots : (typeof r.slots === 'string' ? JSON.parse(r.slots) : []),
      status: r.status,
      createdAt: r.created_at
    }));
  } catch (e) {
    console.error('getUserRegistrations exception', e);
    return [];
  }
}

export async function updateRegistration(id, change) {
  if (!useSupabase) {
    const regs = read('be_registrations', []);
    const idx = regs.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    const prev = regs[idx];
    if (prev.status === 'approved' && change.slots) {
      await freeSlots(prev.slots || []);
    }
    regs[idx] = { ...prev, ...change, status: 'pending' };
    write('be_registrations', regs);
    return true;
  }
  try {
    // if previously approved and slots are changing, free old slots
    const { data: prev, error } = await supabase.from('registrations').select('*').eq('id', id).limit(1).single();
    if (error) { console.error('Supabase updateRegistration select error', error); return false; }
    if (prev.status === 'approved' && change.slots) {
      await freeSlots(Array.isArray(prev.slots) ? prev.slots : (typeof prev.slots === 'string' ? JSON.parse(prev.slots) : []));
    }
    // Map JavaScript camelCase to database snake_case
    const updateData = {
      parent_name: change.parentName,
      parent_phone: change.parentPhone,
      parent_email: change.parentEmail,
      student_name: change.studentName,
      student_age: change.studentAge,
      student_leerjaar: change.studentLeerjaar,
      student_studierichting: change.studentStudierichting,
      more_kids: change.moreKids,
      slots: Array.isArray(change.slots) ? change.slots : [],
      status: 'pending'
    };
    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    const { error: err2 } = await supabase.from('registrations').update(updateData).eq('id', id);
    if (err2) { console.error('Supabase updateRegistration update error', err2); return false; }
    return true;
  } catch (e) {
    console.error('updateRegistration exception', e);
    return false;
  }
}

export async function deleteRegistration(id) {
  if (!useSupabase) {
    const regs = read('be_registrations', []);
    const idx = regs.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    const prev = regs[idx];
    if (prev.status === 'approved') await freeSlots(prev.slots || []);
    regs.splice(idx, 1);
    write('be_registrations', regs);
    return true;
  }
  const { data, error } = await supabase.from('registrations').select('*').eq('id', id).limit(1).single();
  if (error) { console.error('Supabase deleteRegistration select error', error); return false; }
  if (data.status === 'approved') await freeSlots(data.slots || []);
  const { error: err2 } = await supabase.from('registrations').delete().eq('id', id);
  if (err2) { console.error('Supabase deleteRegistration delete error', err2); return false; }
  return true;
}


