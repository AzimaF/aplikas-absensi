import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Layout from '../../components/Layout/Layout';
import { DIVISI } from '../../data/seedData';

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatTgl(tgl) {
  if (!tgl) return '-';
  const d = new Date(tgl);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function RekapAbsensi() {
  const { karyawan, absensi } = useApp();
  const today = new Date();
  const [filterDiv, setFilterDiv] = useState('');
  const [filterBulan, setFilterBulan] = useState(today.getMonth());
  const [filterTahun] = useState(today.getFullYear());
  const [selectedAbsen, setSelectedAbsen] = useState(null);

  const filtered = absensi.filter(a => {
    const d = new Date(a.tanggal);
    const k = karyawan.find(k => k.nik === a.nik);
    const matchDiv = filterDiv ? k?.divisi === filterDiv : true;
    const matchBulan = d.getMonth() === filterBulan && d.getFullYear() === filterTahun;
    return matchDiv && matchBulan;
  }).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  const hadir = filtered.filter(a => a.jam_masuk).length;
  const terlambat = filtered.filter(a => a.status_masuk === 'Terlambat').length;

  return (
    <Layout>
      <div className="animate-fadein">
        <div className="page-header">
          <h2>Rekap Absensi</h2>
          <p>Laporan kehadiran seluruh karyawan</p>
        </div>

        <div className="filter-row" style={{ marginBottom: '1.5rem' }}>
          <select id="filter-div-absensi" className="form-control" value={filterDiv} onChange={e => setFilterDiv(e.target.value)}>
            <option value="">Semua Divisi</option>
            {DIVISI.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select id="filter-bulan-admin" className="form-control" value={filterBulan} onChange={e => setFilterBulan(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m} {filterTahun}</option>)}
          </select>
        </div>

        <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-content"><h3>{filtered.length}</h3><p>Total Rekap</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-content"><h3>{hadir}</h3><p>Hadir</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-content"><h3>{terlambat}</h3><p>Terlambat</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-content"><h3>{filtered.filter(a => a.jam_pulang).length}</h3><p>Sudah Pulang</p></div>
          </div>
        </div>

        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>NIK</th>
                  <th>Nama</th>
                  <th>Divisi</th>
                  <th>Jam Masuk</th>
                  <th>Jam Pulang</th>
                  <th>Status</th>
                  <th>Foto</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const k = karyawan.find(k => k.nik === a.nik);
                  return (
                    <tr key={a.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{formatTgl(a.tanggal)}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--primary-light)' }}>{a.nik}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{k?.nama || '-'}</td>
                      <td>{k?.divisi || '-'}</td>
                      <td>{a.jam_masuk || '-'}</td>
                      <td>{a.jam_pulang || <span style={{ color: 'var(--warning)', fontSize: '0.8rem' }}>Belum</span>}</td>
                      <td>
                        {a.status_masuk ? (
                          <span className={`badge ${a.status_masuk === 'Terlambat' ? 'terlambat' : 'tepat'}`}>{a.status_masuk}</span>
                        ) : '-'}
                      </td>
                      <td>
                        <button
                          id={`btn-foto-${a.id}`}
                          className="btn btn-outline btn-sm"
                          onClick={() => setSelectedAbsen(a)}
                        >
                          Lihat
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state"><h3>Tidak ada data</h3><p>Tidak ada rekap absensi untuk filter yang dipilih</p></div>
            )}
          </div>
        </div>

        {selectedAbsen && (
          <div className="modal-overlay" onClick={() => setSelectedAbsen(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Foto Absensi – {formatTgl(selectedAbsen.tanggal)}</h3>
                <button className="modal-close" onClick={() => setSelectedAbsen(null)}>✕</button>
              </div>
              <div className="grid-2">
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>FOTO MASUK ({selectedAbsen.jam_masuk})</h4>
                  {selectedAbsen.foto_masuk ? (
                    <img src={selectedAbsen.foto_masuk} alt="" style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)' }} />
                  ) : <div style={{ padding: '3rem', background: 'var(--bg-input)', borderRadius: 8, textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada foto</div>}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>FOTO PULANG ({selectedAbsen.jam_pulang || '-'})</h4>
                  {selectedAbsen.foto_pulang ? (
                    <img src={selectedAbsen.foto_pulang} alt="" style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)' }} />
                  ) : <div style={{ padding: '3rem', background: 'var(--bg-input)', borderRadius: 8, textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada foto</div>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                <div className="detail-box">
                  <div className="label">Koordinat Masuk</div>
                  <div className="value" style={{ fontSize: '0.75rem' }}>
                    {selectedAbsen.lat_masuk ? `${selectedAbsen.lat_masuk.toFixed(4)}, ${selectedAbsen.lng_masuk.toFixed(4)}` : '-'}
                  </div>
                </div>
                <div className="detail-box">
                  <div className="label">Status</div>
                  <div className="value">{selectedAbsen.status_masuk || '-'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
