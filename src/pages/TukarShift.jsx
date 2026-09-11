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

export default function TukarShift() {
  const { user, karyawan, jadwal, getShiftById, ajukanTukarShift, tukarShift } = useApp();
  const [form, setForm] = useState({
    tanggal_pemohon: '',
    nik_tujuan: '',
    tanggal_tujuan: '',
    alasan: '',
  });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  // Hanya sesama karyawan (bukan kepala divisi / admin)
  const divisiKaryawan = karyawan.filter(k =>
    k.divisi === user.divisi &&
    k.nik !== user.nik &&
    k.role === 'karyawan'
  );

  const today = new Date().toISOString().split('T')[0];
  const myWorkDates = jadwal
    .filter(j => j.nik === user.nik && j.tanggal >= today && j.status === 'Kerja')
    .map(j => j.tanggal)
    .sort();

  const targetWorkDates = form.nik_tujuan
    ? jadwal.filter(j => j.nik === form.nik_tujuan && j.tanggal >= today && j.status === 'Kerja').map(j => j.tanggal).sort()
    : [];

  const myJadwalSelected = form.tanggal_pemohon
    ? jadwal.find(j => j.nik === user.nik && j.tanggal === form.tanggal_pemohon)
    : null;

  const targetJadwalSelected = form.nik_tujuan && form.tanggal_tujuan
    ? jadwal.find(j => j.nik === form.nik_tujuan && j.tanggal === form.tanggal_tujuan)
    : null;

  const myShift = myJadwalSelected?.shift_id ? getShiftById(myJadwalSelected.shift_id) : null;
  const targetShift = targetJadwalSelected?.shift_id ? getShiftById(targetJadwalSelected.shift_id) : null;
  const targetKaryawan = form.nik_tujuan ? karyawan.find(k => k.nik === form.nik_tujuan) : null;

  const myPengajuan = tukarShift.filter(t => t.nik_pemohon === user.nik).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tanggal_pemohon || !form.nik_tujuan || !form.tanggal_tujuan || !form.alasan) {
      setAlert({ type: 'error', message: 'Semua kolom harus diisi!' });
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const result = ajukanTukarShift({
      nik_pemohon: user.nik,
      nama_pemohon: user.nama,
      divisi: user.divisi,
      tanggal_pemohon: form.tanggal_pemohon,
      shift_pemohon: myShift?.nama || '-',
      nik_tujuan: form.nik_tujuan,
      nama_tujuan: targetKaryawan?.nama || '-',
      tanggal_tujuan: form.tanggal_tujuan,
      shift_tujuan: targetShift?.nama || '-',
      alasan: form.alasan,
    });

    setLoading(false);
    if (result.success) {
      setAlert({ type: 'success', message: 'Pengajuan tukar shift berhasil dikirim! Menunggu persetujuan kepala divisi.' });
      setForm({ tanggal_pemohon: '', nik_tujuan: '', tanggal_tujuan: '', alasan: '' });
    }
  };

  return (
    <Layout>
      <div className="animate-fadein">
        <div className="page-header">
          <h2>Tukar Shift</h2>
          <p>Ajukan permintaan tukar shift dengan rekan kerja di divisi yang sama</p>
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

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tanggal Shift Saya</label>
                <select
                  id="tanggal-pemohon"
                  className="form-control"
                  value={form.tanggal_pemohon}
                  onChange={e => setForm(f => ({ ...f, tanggal_pemohon: e.target.value }))}
                  required
                >
                  <option value="">-- Pilih Tanggal --</option>
                  {myWorkDates.map(d => <option key={d} value={d}>{formatTgl(d)}</option>)}
                </select>
                {myShift && (
                  <div className="alert alert-info" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                    Shift Anda: <strong>{myShift.nama}</strong> ({myShift.jam_masuk} – {myShift.jam_pulang})
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Karyawan Tujuan (Divisi: {user.divisi})</label>
                <select
                  id="karyawan-tujuan"
                  className="form-control"
                  value={form.nik_tujuan}
                  onChange={e => setForm(f => ({ ...f, nik_tujuan: e.target.value, tanggal_tujuan: '' }))}
                  required
                >
                  <option value="">-- Pilih Karyawan --</option>
                  {divisiKaryawan.map(k => <option key={k.nik} value={k.nik}>{k.nama} ({k.jabatan})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tanggal Shift Tujuan</label>
                <select
                  id="tanggal-tujuan"
                  className="form-control"
                  value={form.tanggal_tujuan}
                  onChange={e => setForm(f => ({ ...f, tanggal_tujuan: e.target.value }))}
                  required
                  disabled={!form.nik_tujuan}
                >
                  <option value="">-- Pilih Tanggal --</option>
                  {targetWorkDates.map(d => <option key={d} value={d}>{formatTgl(d)}</option>)}
                </select>
                {targetShift && (
                  <div className="alert alert-info" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                    Shift {targetKaryawan?.nama}: <strong>{targetShift.nama}</strong> ({targetShift.jam_masuk} – {targetShift.jam_pulang})
                  </div>
                )}
              </div>

              {myShift && targetShift && (
                <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>PREVIEW PENUKARAN</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.nama}</div>
                      <div style={{ color: 'var(--primary-light)', fontSize: '0.8rem' }}>{myShift.nama}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatTgl(form.tanggal_pemohon)}</div>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>ke</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{targetKaryawan?.nama}</div>
                      <div style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>{targetShift.nama}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatTgl(form.tanggal_tujuan)}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Alasan Tukar Shift</label>
                <textarea
                  id="alasan-tukar-shift"
                  className="form-control"
                  rows="3"
                  placeholder="Jelaskan alasan Anda ingin tukar shift..."
                  value={form.alasan}
                  onChange={e => setForm(f => ({ ...f, alasan: e.target.value }))}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button id="btn-submit-tukar-shift" type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
              </button>
            </form>
          </div>

          <div>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Riwayat Pengajuan Saya</h3>
              </div>
              {myPengajuan.length === 0 ? (
                <div className="empty-state">
                  <p>Belum ada pengajuan tukar shift</p>
                </div>
              ) : (
                myPengajuan.map(p => (
                  <div key={p.id} className="approval-card">
                    <div className="approval-header">
                      <div className="approval-info">
                        <h4>Tukar dengan {p.nama_tujuan}</h4>
                        <p>{formatTgl(p.tanggal_pemohon)} → {formatTgl(p.tanggal_tujuan)}</p>
                      </div>
                      <span className={`badge ${p.status === 'Pending' ? 'pending' : p.status === 'Approved' ? 'approved' : 'rejected'}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="approval-detail">
                      <div className="detail-box">
                        <div className="label">Shift Saya</div>
                        <div className="value">{p.shift_pemohon}</div>
                      </div>
                      <div className="detail-box">
                        <div className="label">Shift Tujuan</div>
                        <div className="value">{p.shift_tujuan}</div>
                      </div>
                    </div>
                    <div className="alasan-box">
                      <p>{p.alasan}</p>
                    </div>
                    {p.catatan && (
                      <div className="alert alert-info" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                        Catatan KaDiv: {p.catatan}
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
