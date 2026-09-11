import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout/Layout';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function RiwayatAbsensi() {
  const { user, absensi, getShiftById, jadwal } = useApp();
  const today = new Date();
  const [filterBulan, setFilterBulan] = useState(today.getMonth());
  const [filterTahun, setFilterTahun] = useState(today.getFullYear());
  const [selectedAbsen, setSelectedAbsen] = useState(null);

  const myAbsensi = absensi.filter(a => {
    const d = new Date(a.tanggal);
    return a.nik === user.nik && d.getMonth() === filterBulan && d.getFullYear() === filterTahun;
  }).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  const hadir = myAbsensi.filter(a => a.jam_masuk).length;
  const terlambat = myAbsensi.filter(a => a.status_masuk === 'Terlambat').length;
  const tepat = myAbsensi.filter(a => a.status_masuk === 'Tepat Waktu').length;

  const formatTgl = (tgl) => {
    const d = new Date(tgl);
    return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  const years = [today.getFullYear() - 1, today.getFullYear()];

  return (
    <Layout>
      <div className="animate-fadein">
        <div className="page-header">
          <h2>Riwayat Absensi</h2>
          <p>Lihat rekap kehadiran bulanan Anda</p>
        </div>

        {/* Filter */}
        <div className="filter-row">
          <select id="filter-bulan" className="form-control" value={filterBulan} onChange={e => setFilterBulan(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select id="filter-tahun" className="form-control" value={filterTahun} onChange={e => setFilterTahun(+e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-content"><h3>{hadir}</h3><p>Hari Hadir</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-content"><h3>{tepat}</h3><p>Tepat Waktu</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-content"><h3>{terlambat}</h3><p>Terlambat</p></div>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Detail Kehadiran – {MONTHS[filterBulan]} {filterTahun}</h3>
          </div>

          {myAbsensi.length === 0 ? (
            <div className="empty-state">
              <h3>Tidak ada data</h3>
              <p>Tidak ada rekap absensi untuk bulan ini</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Jam Masuk</th>
                    <th>Jam Pulang</th>
                    <th>Durasi</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {myAbsensi.map(a => {
                    let durasi = '-';
                    if (a.jam_masuk && a.jam_pulang) {
                      const [hM, mM] = a.jam_masuk.split(':').map(Number);
                      const [hP, mP] = a.jam_pulang.split(':').map(Number);
                      let menit = (hP * 60 + mP) - (hM * 60 + mM);
                      if (menit < 0) menit += 24 * 60;
                      const jam = Math.floor(menit / 60);
                      const sisa = menit % 60;
                      durasi = `${jam}j ${sisa}m`;
                    }

                    return (
                      <tr key={a.id}>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatTgl(a.tanggal)}</td>
                        <td>{a.jam_masuk || '-'}</td>
                        <td>{a.jam_pulang || <span style={{ color: 'var(--warning)', fontSize: '0.8rem' }}>Belum absen</span>}</td>
                        <td>{durasi}</td>
                        <td>
                          {a.status_masuk ? (
                            <span className={`badge ${a.status_masuk === 'Terlambat' ? 'terlambat' : 'tepat'}`}>{a.status_masuk}</span>
                          ) : '-'}
                        </td>
                        <td>
                          <button className="btn btn-outline btn-sm" onClick={() => setSelectedAbsen(a)} id={`btn-detail-${a.id}`}>
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedAbsen && (
          <div className="modal-overlay" onClick={() => setSelectedAbsen(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Detail Absensi – {formatTgl(selectedAbsen.tanggal)}</h3>
                <button className="modal-close" onClick={() => setSelectedAbsen(null)}>✕</button>
              </div>

              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>FOTO MASUK</h4>
                  {selectedAbsen.foto_masuk ? (
                    <img src={selectedAbsen.foto_masuk} alt="Foto masuk" style={{ width: '100%', borderRadius: 8, border: '2px solid var(--success)' }} />
                  ) : <div style={{ padding: '2rem', background: 'var(--bg-input)', borderRadius: 8, textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada foto</div>}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>FOTO PULANG</h4>
                  {selectedAbsen.foto_pulang ? (
                    <img src={selectedAbsen.foto_pulang} alt="Foto pulang" style={{ width: '100%', borderRadius: 8, border: '2px solid var(--danger)' }} />
                  ) : <div style={{ padding: '2rem', background: 'var(--bg-input)', borderRadius: 8, textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada foto</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="detail-box">
                  <div className="label">Jam Masuk</div>
                  <div className="value">{selectedAbsen.jam_masuk || '-'}</div>
                </div>
                <div className="detail-box">
                  <div className="label">Jam Pulang</div>
                  <div className="value">{selectedAbsen.jam_pulang || '-'}</div>
                </div>
                <div className="detail-box">
                  <div className="label">Status Masuk</div>
                  <div className="value">{selectedAbsen.status_masuk || '-'}</div>
                </div>
                <div className="detail-box">
                  <div className="label">Koordinat Masuk</div>
                  <div className="value" style={{ fontSize: '0.75rem' }}>
                    {selectedAbsen.lat_masuk ? `${selectedAbsen.lat_masuk?.toFixed(4)}, ${selectedAbsen.lng_masuk?.toFixed(4)}` : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
