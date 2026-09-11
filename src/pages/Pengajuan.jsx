import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout/Layout';

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatTgl(tgl) {
  if (!tgl) return '-';
  const d = new Date(tgl);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Pengajuan() {
  const { user, tukarShift, tukarLibur } = useApp();
  const [activeTab, setActiveTab] = useState('shift');

  const myShift = tukarShift.filter(t => t.nik_pemohon === user.nik).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const myLibur = tukarLibur.filter(t => t.nik === user.nik).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const allPending = [...myShift, ...myLibur].filter(t => t.status === 'Pending').length;
  const allApproved = [...myShift, ...myLibur].filter(t => t.status === 'Approved').length;
  const allRejected = [...myShift, ...myLibur].filter(t => t.status === 'Rejected').length;

  return (
    <Layout>
      <div className="animate-fadein">
        <div className="page-header">
          <h2>Status Pengajuan</h2>
          <p>Pantau status semua pengajuan tukar shift dan tukar libur Anda</p>
        </div>

        <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-content"><h3>{myShift.length + myLibur.length}</h3><p>Total Pengajuan</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-content"><h3>{allPending}</h3><p>Menunggu Approval</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-content"><h3>{allApproved}</h3><p>Disetujui</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-content"><h3>{allRejected}</h3><p>Ditolak</p></div>
          </div>
        </div>

        <div className="tabs">
          <button id="tab-shift" className={`tab ${activeTab === 'shift' ? 'active' : ''}`} onClick={() => setActiveTab('shift')}>
            Tukar Shift ({myShift.length})
          </button>
          <button id="tab-libur" className={`tab ${activeTab === 'libur' ? 'active' : ''}`} onClick={() => setActiveTab('libur')}>
            Tukar Libur ({myLibur.length})
          </button>
        </div>

        {activeTab === 'shift' && (
          <div>
            {myShift.length === 0 ? (
              <div className="card"><div className="empty-state"><h3>Belum ada pengajuan</h3><p>Anda belum pernah mengajukan tukar shift</p></div></div>
            ) : (
              myShift.map(p => (
                <div key={p.id} className="approval-card">
                  <div className="approval-header">
                    <div className="approval-info">
                      <h4>Tukar Shift dengan {p.nama_tujuan}</h4>
                      <p>Diajukan: {new Date(p.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                    </div>
                    <span className={`badge ${p.status === 'Pending' ? 'pending' : p.status === 'Approved' ? 'approved' : 'rejected'}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="approval-detail">
                    <div className="detail-box">
                      <div className="label">Shift Saya ({formatTgl(p.tanggal_pemohon)})</div>
                      <div className="value">{p.shift_pemohon}</div>
                    </div>
                    <div className="detail-box">
                      <div className="label">Shift {p.nama_tujuan} ({formatTgl(p.tanggal_tujuan)})</div>
                      <div className="value">{p.shift_tujuan}</div>
                    </div>
                  </div>
                  <div className="alasan-box"><p>{p.alasan}</p></div>
                  {p.catatan && (
                    <div className={`alert ${p.status === 'Approved' ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                      Catatan KaDiv: {p.catatan}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'libur' && (
          <div>
            {myLibur.length === 0 ? (
              <div className="card"><div className="empty-state"><h3>Belum ada pengajuan</h3><p>Anda belum pernah mengajukan tukar hari libur</p></div></div>
            ) : (
              myLibur.map(p => (
                <div key={p.id} className="approval-card">
                  <div className="approval-header">
                    <div className="approval-info">
                      <h4>Tukar Hari Libur</h4>
                      <p>Diajukan: {new Date(p.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                    </div>
                    <span className={`badge ${p.status === 'Pending' ? 'pending' : p.status === 'Approved' ? 'approved' : 'rejected'}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="approval-detail">
                    <div className="detail-box">
                      <div className="label">Libur → Kerja</div>
                      <div className="value" style={{ fontSize: '0.8rem' }}>{formatTgl(p.tanggal_libur_lama)}</div>
                    </div>
                    <div className="detail-box">
                      <div className="label">Kerja → Libur</div>
                      <div className="value" style={{ fontSize: '0.8rem' }}>{formatTgl(p.tanggal_libur_baru)}</div>
                    </div>
                  </div>
                  <div className="alasan-box"><p>{p.alasan}</p></div>
                  {p.catatan && (
                    <div className={`alert ${p.status === 'Approved' ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                      Catatan: {p.catatan}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
