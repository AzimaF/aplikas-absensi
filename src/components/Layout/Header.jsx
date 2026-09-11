import React from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/jadwal': 'Jadwal Kerja',
  '/absensi': 'Absensi',
  '/riwayat-absensi': 'Riwayat Absensi',
  '/tukar-shift': 'Tukar Shift',
  '/tukar-libur': 'Tukar Hari Libur',
  '/pengajuan': 'Status Pengajuan',
  '/kadiv/anggota': 'Absensi Anggota Divisi',
  '/kadiv/approval-shift': 'Approval Tukar Shift',
  '/kadiv/approval-libur': 'Approval Tukar Hari Libur',
  '/admin/karyawan': 'Manajemen Karyawan',
  '/admin/shift': 'Manajemen Shift',
  '/admin/jadwal': 'Manajemen Jadwal',
  '/admin/absensi': 'Rekap Absensi',
};

export default function Header() {
  const location = useLocation();
  const { user } = useApp();

  const title = routeTitles[location.pathname] || 'Dashboard';
  const now = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const dateStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <header className="header">
      <h1>{title}</h1>
      <div className="header-right">
        <span className="header-date">{dateStr}</span>
        {user && (
          <div className="badge info">
            {user.nama.split(' ')[0]}
          </div>
        )}
      </div>
    </header>
  );
}
