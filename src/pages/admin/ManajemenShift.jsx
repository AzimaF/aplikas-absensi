import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Layout from '../../components/Layout/Layout';
import Modal from '../../components/common/Modal';

export default function ManajemenShift() {
  const { shifts, tambahShift, updateShift, hapusShift } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ id: '', nama: '', jam_masuk: '', jam_pulang: '', warna: '#1d4ed8' });
  const [alert, setAlert] = useState(null);
  const [confirmHapus, setConfirmHapus] = useState(null);

  const openAdd = () => {
    setEditData(null);
    setForm({ id: `S${shifts.length + 1}`, nama: '', jam_masuk: '08:00', jam_pulang: '16:00', warna: '#1d4ed8' });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditData(s);
    setForm({ ...s });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nama || !form.jam_masuk || !form.jam_pulang) {
      setAlert({ type: 'error', message: 'Semua kolom wajib diisi!' });
      return;
    }

    if (editData) {
      updateShift(editData.id, form);
      setAlert({ type: 'success', message: `Shift "${form.nama}" berhasil diperbarui!` });
    } else {
      tambahShift(form);
      setAlert({ type: 'success', message: `Shift "${form.nama}" berhasil ditambahkan!` });
    }
    setShowModal(false);
  };

  const hitungDurasi = (masuk, pulang) => {
    const [hM, mM] = masuk.split(':').map(Number);
    const [hP, mP] = pulang.split(':').map(Number);
    let menit = (hP * 60 + mP) - (hM * 60 + mM);
    if (menit < 0) menit += 24 * 60;
    return `${Math.floor(menit / 60)} jam${menit % 60 > 0 ? ` ${menit % 60} menit` : ''}`;
  };

  return (
    <Layout>
      <div className="animate-fadein">
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>Manajemen Shift</h2>
            <p>Kelola data shift kerja karyawan</p>
          </div>
          <button id="btn-tambah-shift" className="btn btn-primary" onClick={openAdd}>
            Tambah Shift
          </button>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`} style={{ marginBottom: '1.5rem' }}>
            {alert.message}
          </div>
        )}

        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nama Shift</th>
                  <th>Jam Masuk</th>
                  <th>Jam Pulang</th>
                  <th>Durasi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map(s => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.nama}</td>
                    <td>{s.jam_masuk}</td>
                    <td>{s.jam_pulang}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{hitungDurasi(s.jam_masuk, s.jam_pulang)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button id={`btn-edit-shift-${s.id}`} className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                        <button id={`btn-hapus-shift-${s.id}`} className="btn btn-danger btn-sm" onClick={() => setConfirmHapus(s)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shifts.length === 0 && (
              <div className="empty-state"><h3>Belum ada shift</h3></div>
            )}
          </div>
        </div>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Shift' : 'Tambah Shift'}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Shift</label>
              <input id="form-shift-nama" className="form-control" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} required placeholder="Contoh: Shift Pagi" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Jam Masuk</label>
                <input id="form-shift-masuk" type="time" className="form-control" value={form.jam_masuk} onChange={e => setForm(f => ({ ...f, jam_masuk: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Jam Pulang</label>
                <input id="form-shift-pulang" type="time" className="form-control" value={form.jam_pulang} onChange={e => setForm(f => ({ ...f, jam_pulang: e.target.value }))} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Batal</button>
              <button id="btn-simpan-shift" type="submit" className="btn btn-primary">
                {editData ? 'Simpan' : 'Tambah'}
              </button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={!!confirmHapus} onClose={() => setConfirmHapus(null)} title="Konfirmasi Hapus Shift">
          {confirmHapus && (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Hapus shift <strong style={{ color: 'var(--text-primary)' }}>{confirmHapus.nama}</strong>?
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setConfirmHapus(null)}>Batal</button>
                <button id="btn-confirm-hapus-shift" className="btn btn-danger" onClick={() => { hapusShift(confirmHapus.id); setConfirmHapus(null); setAlert({ type: 'success', message: 'Shift berhasil dihapus!' }); }}>Hapus</button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
