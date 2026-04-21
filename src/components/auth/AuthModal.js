import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiEye, FiEyeOff, FiX, FiArrowLeft } from 'react-icons/fi';
import '../../styles/Auth.css';
import { signIn, signUp, resetPassword } from '../../services/storage';

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ['Heel zwak', 'Zwak', 'Oké', 'Sterk', 'Heel sterk'];
  const normalized = Math.min(score, 4);
  return { score: normalized, label: labels[normalized] };
}

function AuthModal({ onClose, onAuthChange }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const firstInputRef = useRef(null);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [mode, showForgotPassword]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const trimmableFields = ['email', 'username'];
    const newValue = trimmableFields.includes(name) ? value.replace(/\s/g, '') : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setShowForgotPassword(false);
  };

  const passwordStrength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password]
  );

  const canLogin = Boolean((form.username || form.email) && form.password) && !isSubmitting;

  const canRegister = Boolean(
    form.name &&
      form.email &&
      form.username &&
      form.password &&
      form.confirmPassword &&
      !isSubmitting
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!canLogin) return;

    setIsSubmitting(true);
    try {
      const result = await signIn(form.username || form.email, form.password);
      if (!result?.ok) {
        if (result?.reason === 'email_not_confirmed') {
          setError('Je e-mailadres is nog niet bevestigd. Controleer je mailbox en klik op de bevestigingslink.');
          return;
        }
        setError('Ongeldige inloggegevens. Controleer je gebruikersnaam/e-mail en wachtwoord.');
        return;
      }
      onAuthChange(result.user);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (isSubmitting) return;

    if (!form.name || !form.email || !form.username || !form.password) {
      setError('Vul alle velden in');
      return;
    }
    if (form.password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens lang zijn');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('De wachtwoorden komen niet overeen');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Vul een geldig e-mailadres in');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUp({
        name: form.name,
        email: form.email,
        username: form.username,
        password: form.password,
        role: 'parent'
      });

      if (!result?.ok) {
        if (result?.reason === 'rate_limit') {
          setError('Te veel pogingen. Wacht 15 seconden en probeer opnieuw.');
          return;
        }
        if (result?.reason === 'already_exists') {
          setError('Gebruikersnaam of e-mailadres bestaat al. Probeer een andere combinatie.');
          return;
        }
        setError('Account aanmaken is mislukt. Probeer het opnieuw.');
        return;
      }

      const signInResult = await signIn(form.email, form.password);
      if (signInResult?.ok) {
        onAuthChange(signInResult.user);
        onClose();
      } else {
        if (signInResult?.reason === 'email_not_confirmed') {
          setSuccess('Account aangemaakt! Bevestig eerst je e-mailadres via de mail, daarna kun je inloggen.');
          return;
        }
        setSuccess('Account aangemaakt! Je kunt nu inloggen.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!forgotEmail) {
      setError('Vul je e-mailadres in');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await resetPassword(forgotEmail.trim());
      if (result?.ok) {
        setSuccess('We hebben een mail gestuurd met instructies om je wachtwoord te resetten.');
      } else {
        setError('Kon geen reset-mail sturen. Probeer het later opnieuw.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ModalBackdrop" onClick={onClose}>
      <div className="Modal" onClick={(e) => e.stopPropagation()}>
        <button className="Modal__close" onClick={onClose} aria-label="Sluiten">
          <FiX aria-hidden="true" />
        </button>

        {!showForgotPassword && (
          <div className="Tabs">
            <button
              className={mode === 'login' ? 'tab active' : 'tab'}
              onClick={() => switchMode('login')}
              type="button"
            >
              Inloggen
            </button>
            <button
              className={mode === 'register' ? 'tab active' : 'tab'}
              onClick={() => switchMode('register')}
              type="button"
            >
              Registreren
            </button>
          </div>
        )}

        {showForgotPassword ? (
          <form className="AuthForm" onSubmit={handleForgotPassword}>
            <h3 className="AuthForm__title">Wachtwoord vergeten</h3>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <label>
              <span>E-mailadres</span>
              <input
                ref={firstInputRef}
                type="email"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value.replace(/\s/g, ''));
                  if (error) setError('');
                  if (success) setSuccess('');
                }}
                placeholder="jan@voorbeeld.nl"
                autoComplete="email"
              />
            </label>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={isSubmitting || !forgotEmail}
            >
              {isSubmitting ? 'Bezig...' : 'Reset-mail versturen'}
            </button>
            <button
              className="AuthForm__linkBtn"
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setError('');
                setSuccess('');
              }}
            >
              <FiArrowLeft aria-hidden="true" /> Terug naar inloggen
            </button>
          </form>
        ) : mode === 'login' ? (
          <form className="AuthForm" onSubmit={handleLogin}>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <label>
              <span>Gebruikersnaam of E-mail</span>
              <input
                ref={firstInputRef}
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="gebruikersnaam of e-mail"
                autoComplete="username"
              />
            </label>
            <label>
              <span>Wachtwoord</span>
              <div className="AuthForm__inputWithIcon">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="AuthForm__toggleBtn"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
                >
                  {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                </button>
              </div>
            </label>
            <button
              className="AuthForm__linkBtn AuthForm__linkBtn--right"
              type="button"
              onClick={() => {
                setShowForgotPassword(true);
                setForgotEmail(form.email || form.username || '');
              }}
            >
              Wachtwoord vergeten?
            </button>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={!canLogin}
            >
              {isSubmitting ? 'Bezig met inloggen...' : 'Inloggen'}
            </button>
          </form>
        ) : (
          <form className="AuthForm" onSubmit={handleRegister}>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <label>
              <span>Volledige naam</span>
              <input
                ref={firstInputRef}
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
              <div className="AuthForm__inputWithIcon">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimaal 6 tekens"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="AuthForm__toggleBtn"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
                >
                  {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                </button>
              </div>
              {form.password && (
                <div className={`AuthForm__strength AuthForm__strength--${passwordStrength.score}`}>
                  <div className="AuthForm__strengthBar">
                    <div className="AuthForm__strengthFill" />
                  </div>
                  <span className="AuthForm__strengthLabel">{passwordStrength.label}</span>
                </div>
              )}
            </label>
            <label>
              <span>Wachtwoord bevestigen</span>
              <div className="AuthForm__inputWithIcon">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Herhaal je wachtwoord"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="AuthForm__toggleBtn"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  aria-label={showConfirmPassword ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
                >
                  {showConfirmPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <span className="AuthForm__fieldHint AuthForm__fieldHint--error">
                  Wachtwoorden komen niet overeen
                </span>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && (
                <span className="AuthForm__fieldHint AuthForm__fieldHint--ok">
                  Wachtwoorden komen overeen
                </span>
              )}
            </label>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={!canRegister}
            >
              {isSubmitting ? 'Bezig met aanmaken...' : 'Account aanmaken'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
