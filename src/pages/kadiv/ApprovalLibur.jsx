import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Layout from '../../components/Layout/Layout';
import Modal from '../../components/common/Modal';

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatTgl(tgl) {
  if (!tgl) return '-';
  const d = new Date(tgl);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function ApprovalLibur() {
  const { user, tukarLibur, approveTukarLibur } = useApp();
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [selectedReq, setSelectedReq] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState(null);

  const divisiRequests = tukarLibur
    .filter(t => t.divisi === user.divisi && (filterStatus === 'all' || t.status === filterStatus))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const pendingCount = tukarLibur.filter(t => t.divisi === user.divisi && t.status === 'Pending').length;

  const handleAction = async (action) => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 500));
    approveTukarLibur(selectedReq.id, action, catatan);
    setProcessing(false);
    setSelectedReq(null);
    setCatatan('');
    setAlert({
      type: action === 'approve' ? 'success' : 'error',
      message: action === 'approve' ? 'Pengajuan berhasil disetujui! Jadwal libur sudah diperbarui.' : 'Pengajuan telah ditolak.'
    });
  };

  return (
    <Layout>
      <div className="animate-fadein">
        <div className="page-header">
          <h2>Approval Tukar Hari Libur</h2>
          <p>Kelola pengajuan tukar hari libur karyawan Divisi {user.divisi}</p>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`} style={{ marginBottom: '1.5rem' }}>
            {alert.message}
          </div>
        )}

        {pendingCount > 0 && (
          <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
            Ada <strong>{pendingCount} pengajuan tukar libur</strong> yang menunggu persetujuan Anda
          </div>
        )}

        <div className="filter-row" style={{ marginBottom: '1.5rem' }}>
          <div className="tabs" style={{ marginBottom: 0 }}>
            {['Pending', 'Approved', 'Rejected', 'all'].map(s => (
              <button
                key={s}
                id={`tab-libur-${s.toLowerCase()}`}
                className={`tab ${filterStatus === s ? 'active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === 'all' ? 'Semua' : s}
              </button>
            ))}
          </div>
        </div>

        {divisiRequests.length === 0 ? (
          <div className="card"><div className="empty-state"><h3>Tidak ada pengajuan</h3><p>Tidak ada pengajuan tukar libur untuk ditampilkan</p></div></div>
        ) : (
          divisiRequests.map(req => (
            <div key={req.id} className="approval-card">
              <div className="approval-header">
                <div className="approval-info">
                  <h4>{req.nama}</h4>
                  <p>Diajukan: {new Date(req.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                </div>
                <span className={`badge ${req.status === 'Pending' ? 'pending' : req.status === 'Approved' ? 'approved' : 'rejected'}`}>
                  {req.status}
                </span>
              </div>

              <div className="approval-detail">
                <div className="detail-box">
                  <div className="label">Libur → Kerja</div>
                  <div className="value" style={{ fontSize: '0.8rem' }}>{formatTgl(req.tanggal_libur_lama)}</div>
                </div>
                <div className="detail-box">
                  <div className="label">Kerja → Libur</div>
                  <div className="value" style={{ fontSize: '0.8rem' }}>{formatTgl(req.tanggal_libur_baru)}</div>
                </div>
              </div>

              <div className="alasan-box"><p>{req.alasan}</p></div>

              {req.catatan && (
                <div className={`alert ${req.status === 'Approved' ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  Catatan: {req.catatan}
                </div>
              )}

              {req.status === 'Pending' && (
                <div className="approval-actions" style={{ marginTop: '0.75rem' }}>
                  <button
                    id={`btn-reject-libur-${req.id}`}
                    className="btn btn-danger btn-sm"
                    onClick={() => { setSelectedReq(req); setCatatan(''); }}
                  >
                    Tolak
                  </button>
                  <button
                    id={`btn-approve-libur-${req.id}`}
                    className="btn btn-success btn-sm"
                    onClick={() => { setSelectedReq(req); setCatatan(''); }}
                  >
                    Setujui
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        <Modal isOpen={!!selectedReq} onClose={() => setSelectedReq(null)} title="Konfirmasi Keputusan">
          {selectedReq && (
            <div>
              <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Tukar Libur – {selectedReq.nama}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {formatTgl(selectedReq.tanggal_libur_lama)} (Libur → Kerja) → {formatTgl(selectedReq.tanggal_libur_baru)} (Kerja → Libur)
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Catatan (Opsional)</label>
                <textarea
                  id="catatan-approval-libur"
                  className="form-control"
                  rows="3"
                  placeholder="Tambahkan catatan atau alasan keputusan..."
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  id="btn-confirm-reject-libur"
                  className="btn btn-danger"
                  onClick={() => handleAction('reject')}
                  disabled={processing}
                >
                  {processing ? 'Memproses...' : 'Tolak'}
                </button>
                <button
                  id="btn-confirm-approve-libur"
                  className="btn btn-success"
                  onClick={() => handleAction('approve')}
                  disabled={processing}
                >
                  {processing ? 'Memproses...' : 'Setujui'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
