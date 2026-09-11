import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Layout from '../../components/Layout/Layout';
import Modal from '../../components/common/Modal';
import { EyeIcon } from '../../components/common/Icons';
import { DIVISI } from '../../data/seedData';

export default function ManajemenKaryawan() {
  const { karyawan, tambahKaryawan, updateKaryawan, hapusKaryawan } = useApp();
  const [search, setSearch] = useState('');
  const [filterDiv, setFilterDiv] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ nik: '', nama: '', email: '', password: '', divisi: 'IT', jabatan: '', role: 'karyawan' });
  const [alert, setAlert] = useState(null);
  const [confirmHapus, setConfirmHapus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const filtered = karyawan.filter(k => {
    const matchSearch = k.nama.toLowerCase().includes(search.toLowerCase()) || k.nik.toLowerCase().includes(search.toLowerCase());
    const matchDiv = filterDiv ? k.divisi === filterDiv : true;
    return matchSearch && matchDiv;
  });

  const openAdd = () => {
    setEditData(null);
    setForm({ nik: '', nama: '', email: '', password: 'password123', divisi: 'IT', jabatan: '', role: 'karyawan' });
    setShowPassword(false);
    setShowModal(true);
  };

  const openEdit = (k) => {
    setEditData(k);
    setForm({ ...k });
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nik || !form.nama || !form.jabatan) {
      setAlert({ type: 'error', message: 'NIK, Nama, dan Jabatan wajib diisi!' });
      return;
    }

    if (editData) {
      updateKaryawan(editData.nik, form);
      setAlert({ type: 'success', message: `Data ${form.nama} berhasil diperbarui!` });
    } else {
      if (karyawan.find(k => k.nik === form.nik)) {
        setAlert({ type: 'error', message: 'NIK sudah terdaftar!' });
        return;
      }
      tambahKaryawan(form);
      setAlert({ type: 'success', message: `Karyawan ${form.nama} berhasil ditambahkan!` });
    }
    setShowModal(false);
  };

  const handleHapus = (nik) => {
    hapusKaryawan(nik);
    setConfirmHapus(null);
    setAlert({ type: 'success', message: 'Data karyawan berhasil dihapus!' });
  };

  const roleLabel = { karyawan: 'Karyawan', kadiv: 'Kepala Divisi', admin: 'Admin/HRD' };

  return (
    <Layout>
      <div className="animate-fadein">
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>Manajemen Karyawan</h2>
            <p>Kelola data seluruh karyawan perusahaan</p>
          </div>
          <button id="btn-tambah-karyawan" className="btn btn-primary" onClick={openAdd}>
            Tambah Karyawan
          </button>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`} style={{ marginBottom: '1.5rem' }}>
            {alert.message}
          </div>
        )}

        <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-content"><h3>{karyawan.filter(k => k.role === 'karyawan').length}</h3><p>Karyawan</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-content"><h3>{karyawan.filter(k => k.role === 'kadiv').length}</h3><p>Kepala Divisi</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-content"><h3>{karyawan.filter(k => k.role === 'admin').length}</h3><p>Admin</p></div>
          </div>
        </div>

        <div className="filter-row" style={{ marginBottom: '1.5rem' }}>
          <input
            id="search-karyawan"
            type="text"
            className="form-control"
            placeholder="Cari nama atau NIK..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, maxWidth: 300 }}
          />
          <select id="filter-divisi-karyawan" className="form-control" value={filterDiv} onChange={e => setFilterDiv(e.target.value)}>
            <option value="">Semua Divisi</option>
            {DIVISI.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>NIK</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Divisi</th>
                  <th>Jabatan</th>
                  <th>Role</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(k => (
                  <tr key={k.nik}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--primary-light)' }}>{k.nik}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{k.nama}</td>
                    <td style={{ fontSize: '0.8rem' }}>{k.email}</td>
                    <td><span className="badge info">{k.divisi}</span></td>
                    <td>{k.jabatan}</td>
                    <td>
                      <span className={`badge ${k.role === 'admin' ? 'terlambat' : k.role === 'kadiv' ? 'approved' : 'kerja'}`}>
                        {roleLabel[k.role]}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          id={`btn-edit-${k.nik}`}
                          className="btn btn-outline btn-sm"
                          onClick={() => openEdit(k)}
                        >
                          Edit
                        </button>
                        <button
                          id={`btn-hapus-${k.nik}`}
                          className="btn btn-danger btn-sm"
                          onClick={() => setConfirmHapus(k)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="empty-state"><p>Tidak ada karyawan ditemukan</p></div>}
          </div>
        </div>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Karyawan' : 'Tambah Karyawan'}>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">NIK</label>
                <input id="form-nik" className="form-control" value={form.nik} onChange={e => setForm(f => ({ ...f, nik: e.target.value }))} required disabled={!!editData} placeholder="EMP001" />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select id="form-role" className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="karyawan">Karyawan</option>
                  <option value="kadiv">Kepala Divisi</option>
                  <option value="admin">Admin/HRD</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input id="form-nama" className="form-control" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input id="form-email" type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Divisi</label>
                <select id="form-divisi" className="form-control" value={form.divisi} onChange={e => setForm(f => ({ ...f, divisi: e.target.value }))}>
                  {DIVISI.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Jabatan</label>
                <input id="form-jabatan" className="form-control" value={form.jabatan} onChange={e => setForm(f => ({ ...f, jabatan: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-field">
                <input
                  id="form-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="password123"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Batal</button>
              <button id="btn-simpan-karyawan" type="submit" className="btn btn-primary">
                {editData ? 'Simpan Perubahan' : 'Tambah'}
              </button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={!!confirmHapus} onClose={() => setConfirmHapus(null)} title="Konfirmasi Hapus">
          {confirmHapus && (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Apakah Anda yakin ingin menghapus karyawan <strong style={{ color: 'var(--text-primary)' }}>{confirmHapus.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setConfirmHapus(null)}>Batal</button>
                <button id="btn-confirm-hapus" className="btn btn-danger" onClick={() => handleHapus(confirmHapus.nik)}>Hapus</button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
