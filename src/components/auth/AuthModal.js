import React, { useState } from 'react';
import '../../styles/Auth.css';
import { login, registerUser, getCurrentUserFromStorage } from '../../services/storage';

function AuthModal({ onClose, onAuthChange }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const ok = login(form.username, form.password);
    if (!ok) {
      setError('Ongeldige inloggegevens');
      return;
    }
    onAuthChange(getCurrentUserFromStorage());
    onClose();
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const ok = registerUser({
      name: form.name,
      email: form.email,
      phone: form.phone,
      username: form.username,
      password: form.password,
      role: 'parent'
    });
    if (!ok) {
      setError('Gebruikersnaam bestaat al');
      return;
    }
    login(form.username, form.password);
    onAuthChange(getCurrentUserFromStorage());
    onClose();
  };

  return (
    <div className="ModalBackdrop" onClick={onClose}>
      <div className="Modal" onClick={(e) => e.stopPropagation()}>
        <button className="Modal__close" onClick={onClose}>×</button>
        <div className="Tabs">
          <button className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => setMode('login')}>Inloggen</button>
          <button className={mode === 'register' ? 'tab active' : 'tab'} onClick={() => setMode('register')}>Registreren</button>
        </div>
        {mode === 'login' ? (
          <form className="AuthForm" onSubmit={handleLogin}>
            {error && <div className="error">{error}</div>}
            <label>
              <span>Gebruikersnaam</span>
              <input name="username" value={form.username} onChange={handleChange} required />
            </label>
            <label>
              <span>Wachtwoord</span>
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </label>
            <button className="btn btn-primary" type="submit">Inloggen</button>
          </form>
        ) : (
          <form className="AuthForm" onSubmit={handleRegister}>
            {error && <div className="error">{error}</div>}
            <label>
              <span>Naam</span>
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              <span>E-mail</span>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              <span>Telefoon</span>
              <input name="phone" value={form.phone} onChange={handleChange} required />
            </label>
            <label>
              <span>Gebruikersnaam</span>
              <input name="username" value={form.username} onChange={handleChange} required />
            </label>
            <label>
              <span>Wachtwoord</span>
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </label>
            <button className="btn btn-primary" type="submit">Account aanmaken</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;


