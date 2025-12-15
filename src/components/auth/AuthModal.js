import React, { useState } from 'react';
import '../../styles/Auth.css';
import { signIn, signUp } from '../../services/storage';

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username && !form.email) {
      setError('Vul je gebruikersnaam of e-mailadres in');
      return;
    }
    if (!form.password) {
      setError('Vul je wachtwoord in');
      return;
    }
    const user = await signIn(form.username || form.email, form.password);
    if (!user) {
      setError('Ongeldige inloggegevens. Controleer je gebruikersnaam/e-mail en wachtwoord.');
      return;
    }
    onAuthChange(user);
    onClose();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!form.name || !form.email || !form.phone || !form.username || !form.password) {
      setError('Vul alle velden in');
      return;
    }
    
    if (form.password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens lang zijn');
      return;
    }
    
    if (!form.email.includes('@')) {
      setError('Vul een geldig e-mailadres in');
      return;
    }
    
    const created = await signUp({
      name: form.name,
      email: form.email,
      phone: form.phone,
      username: form.username,
      password: form.password,
      role: 'parent'
    });
    
    if (!created) {
      setError('Gebruikersnaam of e-mailadres bestaat al. Probeer een andere combinatie.');
      return;
    }
    
    // auto-login
    const user = await signIn(form.email, form.password);
    if (user) {
      onAuthChange(user);
      onClose();
    } else {
      setError('Account aangemaakt! Je kunt nu inloggen.');
    }
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
              <span>Gebruikersnaam of E-mail</span>
              <input 
                name="username" 
                value={form.username} 
                onChange={handleChange}
                placeholder="gebruikersnaam@voorbeeld.nl"
                autoComplete="username"
              />
            </label>
            <label>
              <span>Wachtwoord</span>
              <input 
                type="password" 
                name="password" 
                value={form.password} 
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>
            <button className="btn btn-primary" type="submit">Inloggen 🚀</button>
          </form>
        ) : (
          <form className="AuthForm" onSubmit={handleRegister}>
            {error && <div className="error">{error}</div>}
            <label>
              <span>Volledige naam</span>
              <input 
                name="name" 
                value={form.name} 
                onChange={handleChange}
                placeholder="Jan Janssen"
                autoComplete="name"
              />
            </label>
            <label>
              <span>E-mailadres</span>
              <input 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={handleChange}
                placeholder="jan@voorbeeld.nl"
                autoComplete="email"
              />
            </label>
            <label>
              <span>Telefoonnummer</span>
              <input 
                name="phone" 
                value={form.phone} 
                onChange={handleChange}
                placeholder="+32 123 45 67 89"
                autoComplete="tel"
              />
            </label>
            <label>
              <span>Gebruikersnaam</span>
              <input 
                name="username" 
                value={form.username} 
                onChange={handleChange}
                placeholder="gebruikersnaam"
                autoComplete="username"
              />
            </label>
            <label>
              <span>Wachtwoord</span>
              <input 
                type="password" 
                name="password" 
                value={form.password} 
                onChange={handleChange}
                placeholder="Minimaal 6 tekens"
                autoComplete="new-password"
              />
            </label>
            <button className="btn btn-primary" type="submit">Account aanmaken ✨</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;


