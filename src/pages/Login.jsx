import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const demoAccounts = [
  { nik: 'EMP001', nama: 'Budi Santoso', role: 'Karyawan', pass: 'password123' },
  { nik: 'EMP002', nama: 'Siti Rahayu', role: 'Karyawan', pass: 'password123' },
  { nik: 'DIV001', nama: 'Rini Kusuma', role: 'Kepala Divisi', pass: 'password123' },
  { nik: 'ADM001', nama: 'Andi Pratama', role: 'Admin', pass: 'password123' },
];

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const logoSrc = `${import.meta.env.BASE_URL}Logo.png`;
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 600));
    const result = login(nik.trim(), password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const fillDemo = (account) => {
    setNik(account.nik);
    setPassword(account.pass);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <img className="logo-circle" src={logoSrc} alt="AttendanceOS" />
            <h1>AttendanceOS</h1>
            <p>Sistem Presensi Online Karyawan</p>
          </div>

          <div className="demo-accounts">
            <h4>Demo akun (klik untuk mengisi)</h4>
            {demoAccounts.map(acc => (
              <div
                key={acc.nik}
                className="demo-account-item"
                onClick={() => fillDemo(acc)}
                title={`Klik untuk login sebagai ${acc.nama}`}
              >
                <span>{acc.nik} – {acc.nama}</span>
                <span className="role-badge">{acc.role}</span>
              </div>
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="nik-input">NIK (Nomor Induk Karyawan)</label>
              <input
                id="nik-input"
                type="text"
                className="form-control"
                placeholder="Contoh: EMP001"
                value={nik}
                onChange={e => setNik(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password-input">Password</label>
              <div className="password-field">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <button
              id="btn-login"
              type="submit"
              className="btn btn-primary btn-login"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="login-hint">
            Password default: <strong>password123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
