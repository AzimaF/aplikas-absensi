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

export default function TukarLibur() {
  const { user, jadwal, ajukanTukarLibur, tukarLibur } = useApp();
  const [form, setForm] = useState({ tanggal_libur_lama: '', tanggal_libur_baru: '', alasan: '' });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const liburDates = jadwal
    .filter(j => j.nik === user.nik && j.tanggal >= today && j.status === 'Libur')
    .map(j => j.tanggal)
    .sort();

  const kerjaDates = jadwal
    .filter(j => j.nik === user.nik && j.tanggal >= today && j.status === 'Kerja')
    .map(j => j.tanggal)
    .sort();

  const myPengajuan = tukarLibur
    .filter(t => t.nik === user.nik)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tanggal_libur_lama || !form.tanggal_libur_baru || !form.alasan) {
      setAlert({ type: 'error', message: 'Semua kolom harus diisi!' });
      return;
    }
    if (form.tanggal_libur_lama === form.tanggal_libur_baru) {
      setAlert({ type: 'error', message: 'Tanggal tidak boleh sama!' });
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const result = ajukanTukarLibur({
      nik: user.nik,
      nama: user.nama,
      divisi: user.divisi,
      tanggal_libur_lama: form.tanggal_libur_lama,
      tanggal_libur_baru: form.tanggal_libur_baru,
      alasan: form.alasan,
    });

    setLoading(false);
    if (result.success) {
      setAlert({ type: 'success', message: 'Pengajuan tukar hari libur berhasil dikirim!' });
      setForm({ tanggal_libur_lama: '', tanggal_libur_baru: '', alasan: '' });
    }
  };

  return (
    <Layout>
      <div className="animate-fadein">
        <div className="page-header">
          <h2>Tukar Hari Libur</h2>
          <p>Ajukan penukaran hari libur dengan hari kerja</p>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`} style={{ marginBottom: '1.5rem' }}>
            {alert.message}
          </div>
        )}

        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Form Pengajuan</h3>
            </div>

            <div className="alert alert-info" style={{ marginBottom: '1.5rem', fontSize: '0.8rem' }}>
              <strong>Cara kerja:</strong> Pilih hari libur yang ingin dijadikan hari kerja, lalu pilih hari kerja yang ingin dijadikan hari libur pengganti.
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Hari Libur yang Ingin Ditukar (menjadi Kerja)</label>
                <select
                  id="tanggal-libur-lama"
                  className="form-control"
                  value={form.tanggal_libur_lama}
                  onChange={e => setForm(f => ({ ...f, tanggal_libur_lama: e.target.value }))}
                  required
                >
                  <option value="">-- Pilih Hari Libur --</option>
                  {liburDates.map(d => <option key={d} value={d}>{formatTgl(d)}</option>)}
                </select>
                {liburDates.length === 0 && (
                  <div className="alert alert-warning" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                    Tidak ada hari libur yang tersedia untuk ditukar
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Hari Kerja Pengganti (menjadi Libur)</label>
                <select
                  id="tanggal-libur-baru"
                  className="form-control"
                  value={form.tanggal_libur_baru}
                  onChange={e => setForm(f => ({ ...f, tanggal_libur_baru: e.target.value }))}
                  required
                >
                  <option value="">-- Pilih Hari Kerja --</option>
                  {kerjaDates.filter(d => d !== form.tanggal_libur_lama).map(d => (
                    <option key={d} value={d}>{formatTgl(d)}</option>
                  ))}
                </select>
              </div>

              {form.tanggal_libur_lama && form.tanggal_libur_baru && (
                <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>PREVIEW PENUKARAN LIBUR</div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.875rem' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <span className="badge libur" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>LIBUR</span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatTgl(form.tanggal_libur_lama)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem' }}>Menjadi Kerja</div>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>ke</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <span className="badge kerja" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>KERJA</span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatTgl(form.tanggal_libur_baru)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.25rem' }}>Menjadi Libur</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Alasan Tukar Hari Libur</label>
                <textarea
                  id="alasan-tukar-libur"
                  className="form-control"
                  rows="3"
                  placeholder="Jelaskan alasan Anda ingin tukar hari libur..."
                  value={form.alasan}
                  onChange={e => setForm(f => ({ ...f, alasan: e.target.value }))}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                id="btn-submit-tukar-libur"
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
              </button>
            </form>
          </div>

          <div>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Riwayat Pengajuan</h3>
              </div>

              {myPengajuan.length === 0 ? (
                <div className="empty-state">
                  <p>Belum ada pengajuan tukar libur</p>
                </div>
              ) : (
                myPengajuan.map(p => (
                  <div key={p.id} className="approval-card">
                    <div className="approval-header">
                      <div className="approval-info">
                        <h4>Tukar Hari Libur</h4>
                        <p>Diajukan: {new Date(p.created_at).toLocaleDateString('id-ID')}</p>
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
                    <div className="alasan-box">
                      <p>{p.alasan}</p>
                    </div>
                    {p.catatan && (
                      <div className="alert alert-info" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                        Catatan: {p.catatan}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
