import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Layout from '../../components/Layout/Layout';

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatTgl(tgl) {
  if (!tgl) return '-';
  const d = new Date(tgl);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function AbsensiAnggota() {
  const { user, karyawan, absensi } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const [filterTanggal, setFilterTanggal] = useState(today);

  // Only show anggota from same division
  const anggotaDivisi = karyawan.filter(k =>
    k.divisi === user.divisi && k.nik !== user.nik && (k.role === 'karyawan')
  );

  const absensiTgl = absensi.filter(a => a.tanggal === filterTanggal);

  const hadir = absensiTgl.filter(a => anggotaDivisi.find(k => k.nik === a.nik)).length;
  const belumAbsen = anggotaDivisi.length - hadir;

  return (
    <Layout>
      <div className="animate-fadein">
        <div className="page-header">
          <h2>Absensi Anggota Divisi</h2>
          <p>Pantau kehadiran anggota divisi {user.divisi}</p>
        </div>

        <div className="filter-row" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Tanggal:</label>
          <input
            id="filter-tanggal-absensi"
            type="date"
            className="form-control"
            value={filterTanggal}
            onChange={e => setFilterTanggal(e.target.value)}
          />
        </div>

        <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon purple">👥</div>
            <div className="stat-content"><h3>{anggotaDivisi.length}</h3><p>Total Anggota</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-content"><h3>{hadir}</h3><p>Hadir</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">❌</div>
            <div className="stat-content"><h3>{belumAbsen}</h3><p>Belum Absen</p></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 Rekap Absensi – {formatTgl(filterTanggal)}</h3>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>NIK</th>
                  <th>Nama</th>
                  <th>Jabatan</th>
                  <th>Jam Masuk</th>
                  <th>Jam Pulang</th>
                  <th>Status</th>
                  <th>Lokasi Masuk</th>
                </tr>
              </thead>
              <tbody>
                {anggotaDivisi.map(k => {
                  const abs = absensiTgl.find(a => a.nik === k.nik);
                  return (
                    <tr key={k.nik}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{k.nik}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{k.nama}</td>
                      <td>{k.jabatan}</td>
                      <td>{abs?.jam_masuk || <span style={{ color: 'var(--text-muted)' }}>-</span>}</td>
                      <td>{abs?.jam_pulang || <span style={{ color: 'var(--text-muted)' }}>-</span>}</td>
                      <td>
                        {abs?.jam_masuk ? (
                          <span className={`badge ${abs.status_masuk === 'Terlambat' ? 'terlambat' : 'tepat'}`}>
                            {abs.status_masuk}
                          </span>
                        ) : (
                          <span className="badge rejected">Belum Hadir</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {abs?.lat_masuk ? `${abs.lat_masuk.toFixed(4)}, ${abs.lng_masuk.toFixed(4)}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {anggotaDivisi.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>Tidak ada anggota</h3>
              <p>Tidak ada karyawan di divisi {user.divisi}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
