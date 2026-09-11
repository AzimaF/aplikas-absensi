import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Layout from '../../components/Layout/Layout';
import { DIVISI } from '../../data/seedData';

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatTgl(tgl) {
  if (!tgl) return '-';
  const d = new Date(tgl);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function ManajemenJadwal() {
  const { karyawan, jadwal, shifts, updateJadwal, tambahJadwal } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const [filterDiv, setFilterDiv] = useState('IT');
  const [filterNik, setFilterNik] = useState('');
  const [editJadwal, setEditJadwal] = useState(null);
  const [alert, setAlert] = useState(null);

  const karyawanDiv = karyawan.filter(k => k.divisi === filterDiv && (k.role === 'karyawan' || k.role === 'kadiv'));
  const selectedNik = filterNik || (karyawanDiv[0]?.nik || '');

  // Get 30 days range
  const range = [];
  for (let i = -2; i <= 27; i++) {
    const d = new Date();
    d.setDate(new Date().getDate() + i);
    range.push(d.toISOString().split('T')[0]);
  }

  const myJadwal = jadwal
    .filter(j => j.nik === selectedNik && range.includes(j.tanggal))
    .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

  const handleSave = () => {
    if (!editJadwal) return;
    const existing = jadwal.find(j => j.id === editJadwal.id);
    if (existing) {
      updateJadwal(editJadwal.id, {
        shift_id: editJadwal.shift_id,
        status: editJadwal.shift_id ? 'Kerja' : 'Libur'
      });
    } else {
      tambahJadwal({
        ...editJadwal,
        status: editJadwal.shift_id ? 'Kerja' : 'Libur'
      });
    }
    setAlert({ type: 'success', message: 'Jadwal berhasil diperbarui!' });
    setEditJadwal(null);
  };

  const selectedKaryawan = karyawan.find(k => k.nik === selectedNik);

  return (
    <Layout>
      <div className="animate-fadein">
        <div className="page-header">
          <h2>Manajemen Jadwal</h2>
          <p>Atur jadwal kerja karyawan</p>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`} style={{ marginBottom: '1.5rem' }}>
            ✅ {alert.message}
          </div>
        )}

        <div className="filter-row" style={{ marginBottom: '1.5rem' }}>
          <select id="filter-div-jadwal" className="form-control" value={filterDiv} onChange={e => { setFilterDiv(e.target.value); setFilterNik(''); }}>
            {DIVISI.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select id="filter-nik-jadwal" className="form-control" value={selectedNik} onChange={e => setFilterNik(e.target.value)}>
            {karyawanDiv.map(k => <option key={k.nik} value={k.nik}>{k.nama}</option>)}
          </select>
        </div>

        {selectedKaryawan && (
          <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-glass)', border: '1px solid var(--border-active)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedKaryawan.nama}</div>
            <span className="badge info">{selectedKaryawan.divisi}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{selectedKaryawan.jabatan}</span>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📅 Jadwal Kerja (30 Hari)</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Klik shift untuk mengubah</div>
          </div>

          <div className="jadwal-grid">
            {myJadwal.map(j => {
              const s = j.shift_id ? shifts.find(sh => sh.id === j.shift_id) : null;
              const isToday = j.tanggal === today;
              const isEditing = editJadwal?.id === j.id;

              return (
                <div key={j.id} className={`jadwal-item ${isToday ? 'today' : ''}`} style={{ gridTemplateColumns: '100px 1fr auto auto' }}>
                  <div className="jadwal-date">
                    <div className="day-name">{formatTgl(j.tanggal)}</div>
                    {isToday && <span style={{ fontSize: '0.65rem', color: 'var(--primary-light)' }}>Hari ini</span>}
                  </div>

                  {isEditing ? (
                    <select
                      id={`select-shift-${j.id}`}
                      className="form-control"
                      style={{ maxWidth: 200, padding: '0.375rem 0.75rem' }}
                      value={editJadwal.shift_id || ''}
                      onChange={e => setEditJadwal(prev => ({ ...prev, shift_id: e.target.value || null }))}
                    >
                      <option value="">Libur</option>
                      {shifts.map(sh => <option key={sh.id} value={sh.id}>{sh.nama} ({sh.jam_masuk}–{sh.jam_pulang})</option>)}
                    </select>
                  ) : (
                    <div>
                      {s ? (
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.nama}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.jam_masuk} – {s.jam_pulang}</div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>–</div>
                      )}
                    </div>
                  )}

                  <span className={`badge ${j.status === 'Kerja' ? 'kerja' : 'libur'}`}>{j.status}</span>

                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {isEditing ? (
                      <>
                        <button id={`btn-save-jadwal-${j.id}`} className="btn btn-success btn-sm" onClick={handleSave}>✓</button>
                        <button className="btn btn-outline btn-sm" onClick={() => setEditJadwal(null)}>✕</button>
                      </>
                    ) : (
                      <button
                        id={`btn-edit-jadwal-${j.id}`}
                        className="btn btn-outline btn-sm"
                        onClick={() => setEditJadwal({ ...j })}
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {myJadwal.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>Tidak ada jadwal</h3>
                <p>Pilih karyawan untuk melihat jadwal</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
