import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout/Layout';

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatTgl(tgl) {
  const d = new Date(tgl);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Jadwal() {
  const { user, jadwal, getShiftById, karyawan } = useApp();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const [filterNik, setFilterNik] = useState(user.nik);

  const range = [];
  for (let i = -2; i <= 27; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    range.push(d.toISOString().split('T')[0]);
  }

  const myJadwal = jadwal
    .filter(j => j.nik === filterNik && range.includes(j.tanggal))
    .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

  const sameDiv = karyawan.filter(k => k.divisi === user.divisi && (k.role === 'karyawan' || k.role === 'kadiv'));

  return (
    <Layout>
      <div className="animate-fadein">
        <div className="page-header">
          <h2>Jadwal Kerja</h2>
          <p>Jadwal 30 hari ke depan</p>
        </div>

        {user.role !== 'karyawan' && (
          <div className="filter-row" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Lihat jadwal:</label>
            <select id="filter-nik" className="form-control" value={filterNik} onChange={e => setFilterNik(e.target.value)}>
              {sameDiv.map(k => <option key={k.nik} value={k.nik}>{k.nama} ({k.nik})</option>)}
            </select>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Jadwal Bulan Ini</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {karyawan.find(k => k.nik === filterNik)?.nama || user.nama}
            </span>
          </div>

          <div className="jadwal-grid">
            {myJadwal.map(j => {
              const s = j.shift_id ? getShiftById(j.shift_id) : null;
              const isToday = j.tanggal === todayStr;

              return (
                <div key={j.id} className={`jadwal-item ${isToday ? 'today' : ''}`}>
                  <div className="jadwal-date">
                    <div className="day-name">{formatTgl(j.tanggal)}</div>
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
                </div>
              );
            })}

            {myJadwal.length === 0 && (
              <div className="empty-state">
                <h3>Tidak ada jadwal</h3>
                <p>Jadwal belum diatur untuk periode ini</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
