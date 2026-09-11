import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout/Layout';

export default function Dashboard() {
  const { user, getJadwalToday, getShiftById, getAbsensiToday, jadwal, absensi, tukarShift, tukarLibur, karyawan } = useApp();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const jadwalHari = getJadwalToday(user.nik);
  const shift = jadwalHari?.shift_id ? getShiftById(jadwalHari.shift_id) : null;
  const absenHari = getAbsensiToday(user.nik);

  // Stats
  const myAbsensi = absensi.filter(a => a.nik === user.nik);
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const absenBulanIni = myAbsensi.filter(a => {
    const d = new Date(a.tanggal);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const terlambatCount = absenBulanIni.filter(a => a.status_masuk === 'Terlambat').length;

  // Pengajuan pending
  const myTukarShift = tukarShift.filter(t => t.nik_pemohon === user.nik);
  const myTukarLibur = tukarLibur.filter(t => t.nik === user.nik);
  const pendingCount = [...myTukarShift, ...myTukarLibur].filter(t => t.status === 'Pending').length;

  // Jadwal 5 hari ke depan
  const today = new Date();
  const upcomingJadwal = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const tgl = d.toISOString().split('T')[0];
    const j = jadwal.find(j => j.nik === user.nik && j.tanggal === tgl);
    if (j) upcomingJadwal.push(j);
  }

  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const formatTanggal = (tgl) => {
    const d = new Date(tgl);
    return `${days[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`;
  };

  const timeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Untuk Admin: tampilkan statistik keseluruhan
  const totalKaryawan = karyawan.filter(k => k.role === 'karyawan' || k.role === 'kadiv').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const absensiHariIni = absensi.filter(a => a.tanggal === todayStr).length;
  const allPending = [...tukarShift, ...tukarLibur].filter(t => t.status === 'Pending').length;

  if (user.role === 'admin') {
    return (
      <Layout>
        <div className="animate-fadein">
          <div className="welcome-banner">
            <div className="welcome-text">
              <h2>Selamat datang, {user.nama.split(' ')[0]}</h2>
              <p>Panel Admin – Kelola semua data sistem presensi</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-light)', fontVariantNumeric: 'tabular-nums' }}>{timeStr}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {days[today.getDay()]}, {today.getDate()} {monthNames[today.getMonth()]} {today.getFullYear()}
              </div>
            </div>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-content"><h3>{totalKaryawan}</h3><p>Total Karyawan</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-content"><h3>{absensiHariIni}</h3><p>Hadir Hari Ini</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-content"><h3>{allPending}</h3><p>Pengajuan Pending</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-content"><h3>{absensi.length}</h3><p>Total Rekap Absensi</p></div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Menu Cepat</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'Data Karyawan', path: '/admin/karyawan' },
                  { label: 'Data Shift', path: '/admin/shift' },
                  { label: 'Jadwal Kerja', path: '/admin/jadwal' },
                  { label: 'Rekap Absensi', path: '/admin/absensi' },
                ].map(item => (
                  <button key={item.path} className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '1rem' }} onClick={() => navigate(item.path)}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Absensi Hari Ini</h3>
              </div>
              {absensi.filter(a => a.tanggal === todayStr).slice(0, 5).map(a => {
                const k = karyawan.find(k => k.nik === a.nik);
                return (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{k?.nama || a.nik}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.jam_masuk} – {a.jam_pulang || 'Belum pulang'}</div>
                    </div>
                    <span className={`badge ${a.status_masuk === 'Terlambat' ? 'terlambat' : 'tepat'}`}>{a.status_masuk}</span>
                  </div>
                );
              })}
              {absensi.filter(a => a.tanggal === todayStr).length === 0 && (
                <div className="empty-state"><p>Belum ada absensi hari ini</p></div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fadein">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="welcome-text">
            <h2>Selamat datang, {user.nama.split(' ')[0]}</h2>
            <p>{user.jabatan} • {user.divisi} • NIK: {user.nik}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-light)', fontVariantNumeric: 'tabular-nums' }}>{timeStr}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {days[today.getDay()]}, {today.getDate()} {monthNames[today.getMonth()]} {today.getFullYear()}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-content">
              <h3 style={{ fontSize: '1.1rem' }}>{jadwalHari?.status || 'N/A'}</h3>
              <p>Status Hari Ini</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <h3>{absenBulanIni.length}</h3>
              <p>Hadir Bulan Ini</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <h3>{terlambatCount}</h3>
              <p>Terlambat Bulan Ini</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <h3>{pendingCount}</h3>
              <p>Pengajuan Pending</p>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* Status Absensi Hari Ini */}
          <div className="card glow">
            <div className="card-header">
              <h3 className="card-title">Absensi Hari Ini</h3>
              {jadwalHari && <span className={`badge ${jadwalHari.status === 'Kerja' ? 'kerja' : 'libur'}`}>{jadwalHari.status}</span>}
            </div>

            {shift && (
              <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Shift Hari Ini</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{shift.nama}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--primary-light)' }}>{shift.jam_masuk} – {shift.jam_pulang}</div>
              </div>
            )}

            {jadwalHari?.status === 'Libur' ? (
              <div className="alert alert-info">Anda terjadwal libur hari ini. Selamat beristirahat!</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.875rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>MASUK</div>
                    {absenHari?.jam_masuk ? (
                      <>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>{absenHari.jam_masuk}</div>
                        <span className={`badge ${absenHari.status_masuk === 'Terlambat' ? 'terlambat' : 'tepat'}`} style={{ marginTop: '0.25rem' }}>
                          {absenHari.status_masuk}
                        </span>
                      </>
                    ) : (
                      <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>--:--</div>
                    )}
                  </div>
                  <div style={{ padding: '0.875rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>PULANG</div>
                    {absenHari?.jam_pulang ? (
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>{absenHari.jam_pulang}</div>
                    ) : (
                      <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>--:--</div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    id="btn-absen-masuk-dashboard"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={!!absenHari?.jam_masuk || jadwalHari?.status === 'Libur'}
                    onClick={() => navigate('/absensi')}
                  >
                    {absenHari?.jam_masuk ? 'Sudah Masuk' : 'Absen Masuk'}
                  </button>
                  <button
                    id="btn-absen-pulang-dashboard"
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                    disabled={!absenHari?.jam_masuk || !!absenHari?.jam_pulang}
                    onClick={() => navigate('/absensi')}
                  >
                    {absenHari?.jam_pulang ? 'Sudah Pulang' : 'Absen Pulang'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Jadwal Mendatang */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">5 Hari ke Depan</h3>
            </div>
            <div className="jadwal-grid">
              {upcomingJadwal.map((j, i) => {
                const s = j.shift_id ? getShiftById(j.shift_id) : null;
                const isToday = j.tanggal === todayStr;
                return (
                  <div key={j.id} className={`jadwal-item ${isToday ? 'today' : ''}`}>
                    <div className="jadwal-date">
                      <div className="day-name">{formatTanggal(j.tanggal)}</div>
                      {isToday && <span style={{ fontSize: '0.65rem', color: 'var(--primary-light)' }}>Hari ini</span>}
                    </div>
                    <div>
                      {s ? (
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.nama}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.jam_masuk} – {s.jam_pulang}</div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Libur</div>
                      )}
                    </div>
                    <span className={`badge ${j.status === 'Kerja' ? 'kerja' : 'libur'}`}>{j.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Riwayat Absensi Terbaru */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title">Riwayat Absensi Terbaru</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/riwayat-absensi')}>Lihat Semua</button>
          </div>
          {myAbsensi.length === 0 ? (
            <div className="empty-state"><p>Belum ada data absensi</p></div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Jam Masuk</th>
                    <th>Jam Pulang</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myAbsensi.slice(-5).reverse().map(a => (
                    <tr key={a.id}>
                      <td>{formatTanggal(a.tanggal)}</td>
                      <td>{a.jam_masuk || '-'}</td>
                      <td>{a.jam_pulang || '-'}</td>
                      <td><span className={`badge ${a.status_masuk === 'Terlambat' ? 'terlambat' : 'tepat'}`}>{a.status_masuk}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
