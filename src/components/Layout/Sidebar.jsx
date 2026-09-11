import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const navKaryawan = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/jadwal', label: 'Jadwal Kerja' },
  { path: '/absensi', label: 'Absensi' },
  { path: '/riwayat-absensi', label: 'Riwayat Absensi' },
  { path: '/tukar-shift', label: 'Tukar Shift' },
  { path: '/tukar-libur', label: 'Tukar Hari Libur' },
  { path: '/pengajuan', label: 'Status Pengajuan' },
];

const navKadiv = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/jadwal', label: 'Jadwal Kerja' },
  { path: '/absensi', label: 'Absensi' },
  { path: '/riwayat-absensi', label: 'Riwayat Absensi' },
  { path: '/kadiv/anggota', label: 'Absensi Anggota' },
  { path: '/kadiv/approval-shift', label: 'Approval Tukar Shift' },
  { path: '/kadiv/approval-libur', label: 'Approval Tukar Libur' },
];

const navAdmin = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/admin/karyawan', label: 'Data Karyawan' },
  { path: '/admin/shift', label: 'Data Shift' },
  { path: '/admin/jadwal', label: 'Jadwal Kerja' },
  { path: '/admin/absensi', label: 'Rekap Absensi' },
];

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useApp();
  const logoSrc = `${import.meta.env.BASE_URL}Logo.png`;

  if (!user) return null;

  const sections = user.role === 'kadiv'
    ? [
        { title: 'Menu Utama', items: navKadiv.slice(0, 4) },
        { title: 'Kepala Divisi', items: navKadiv.slice(4) },
      ]
    : user.role === 'admin'
    ? [{ title: 'Menu Admin', items: navAdmin }]
    : [{ title: 'Menu Utama', items: navKaryawan }];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user.nama.split(' ').map(n => n[0]).slice(0, 2).join('');

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img className="logo-icon" src={logoSrc} alt="AttendanceOS" />
        <div>
          <h2>AttendanceOS</h2>
          <p>Sistem Presensi Online</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => (
          <div key={section.title}>
            <p className="nav-section-title">{section.title}</p>
            {section.items.map(item => (
              <button
                key={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">{initial}</div>
        <div className="user-info">
          <h4>{user.nama.split(' ').slice(0, 2).join(' ')}</h4>
          <p>{user.role === 'kadiv' ? 'Kepala Divisi' : user.role === 'admin' ? 'Admin/HRD' : 'Karyawan'} • {user.divisi}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout" aria-label="Logout">
          <LogoutIcon />
        </button>
      </div>
    </aside>
  );
}
