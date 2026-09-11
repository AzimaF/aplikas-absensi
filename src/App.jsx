import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Jadwal from './pages/Jadwal';
import Absensi from './pages/Absensi';
import RiwayatAbsensi from './pages/RiwayatAbsensi';
import TukarShift from './pages/TukarShift';
import TukarLibur from './pages/TukarLibur';
import Pengajuan from './pages/Pengajuan';

// KaDiv Pages
import AbsensiAnggota from './pages/kadiv/AbsensiAnggota';
import ApprovalShift from './pages/kadiv/ApprovalShift';
import ApprovalLibur from './pages/kadiv/ApprovalLibur';

// Admin Pages
import ManajemenKaryawan from './pages/admin/ManajemenKaryawan';
import ManajemenShift from './pages/admin/ManajemenShift';
import ManajemenJadwal from './pages/admin/ManajemenJadwal';
import RekapAbsensi from './pages/admin/RekapAbsensi';

// Protected route component
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useApp();

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
}

function AppRoutes() {
  const { user } = useApp();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />

      {/* Common routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/jadwal" element={<ProtectedRoute allowedRoles={['karyawan', 'kadiv']}><Jadwal /></ProtectedRoute>} />
      <Route path="/absensi" element={<ProtectedRoute allowedRoles={['karyawan', 'kadiv']}><Absensi /></ProtectedRoute>} />
      <Route path="/riwayat-absensi" element={<ProtectedRoute allowedRoles={['karyawan', 'kadiv']}><RiwayatAbsensi /></ProtectedRoute>} />
      <Route path="/tukar-shift" element={<ProtectedRoute allowedRoles={['karyawan', 'kadiv']}><TukarShift /></ProtectedRoute>} />
      <Route path="/tukar-libur" element={<ProtectedRoute allowedRoles={['karyawan', 'kadiv']}><TukarLibur /></ProtectedRoute>} />
      <Route path="/pengajuan" element={<ProtectedRoute allowedRoles={['karyawan', 'kadiv']}><Pengajuan /></ProtectedRoute>} />

      {/* KaDiv routes */}
      <Route path="/kadiv/anggota" element={<ProtectedRoute allowedRoles={['kadiv']}><AbsensiAnggota /></ProtectedRoute>} />
      <Route path="/kadiv/approval-shift" element={<ProtectedRoute allowedRoles={['kadiv']}><ApprovalShift /></ProtectedRoute>} />
      <Route path="/kadiv/approval-libur" element={<ProtectedRoute allowedRoles={['kadiv']}><ApprovalLibur /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/karyawan" element={<ProtectedRoute allowedRoles={['admin']}><ManajemenKaryawan /></ProtectedRoute>} />
      <Route path="/admin/shift" element={<ProtectedRoute allowedRoles={['admin']}><ManajemenShift /></ProtectedRoute>} />
      <Route path="/admin/jadwal" element={<ProtectedRoute allowedRoles={['admin']}><ManajemenJadwal /></ProtectedRoute>} />
      <Route path="/admin/absensi" element={<ProtectedRoute allowedRoles={['admin']}><RekapAbsensi /></ProtectedRoute>} />

      {/* Redirect */}
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  );
}

export default function App() {
  return (
    // Tambahkan basename di sini sesuai nama repository GitHub Anda
    <BrowserRouter basename="/aplikas-absensi">
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}