import React, { createContext, useContext, useState, useEffect } from 'react';
import { seedLocalStorage } from '../data/seedData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [karyawan, setKaryawanState] = useState([]);
  const [shifts, setShiftsState] = useState([]);
  const [jadwal, setJadwalState] = useState([]);
  const [absensi, setAbsensiState] = useState([]);
  const [tukarShift, setTukarShiftState] = useState([]);
  const [tukarLibur, setTukarLiburState] = useState([]);

  useEffect(() => {
    seedLocalStorage();
    setKaryawanState(JSON.parse(localStorage.getItem('karyawan') || '[]'));
    setShiftsState(JSON.parse(localStorage.getItem('shifts') || '[]'));
    setJadwalState(JSON.parse(localStorage.getItem('jadwal') || '[]'));
    setAbsensiState(JSON.parse(localStorage.getItem('absensi') || '[]'));
    setTukarShiftState(JSON.parse(localStorage.getItem('tukar_shift') || '[]'));
    setTukarLiburState(JSON.parse(localStorage.getItem('tukar_libur') || '[]'));

    const savedUser = localStorage.getItem('current_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const saveKaryawan = (data) => { localStorage.setItem('karyawan', JSON.stringify(data)); setKaryawanState(data); };
  const saveShifts = (data) => { localStorage.setItem('shifts', JSON.stringify(data)); setShiftsState(data); };
  const saveJadwal = (data) => { localStorage.setItem('jadwal', JSON.stringify(data)); setJadwalState(data); };
  const saveAbsensi = (data) => { localStorage.setItem('absensi', JSON.stringify(data)); setAbsensiState(data); };
  const saveTukarShift = (data) => { localStorage.setItem('tukar_shift', JSON.stringify(data)); setTukarShiftState(data); };
  const saveTukarLibur = (data) => { localStorage.setItem('tukar_libur', JSON.stringify(data)); setTukarLiburState(data); };

  const login = (nik, password) => {
    const found = karyawan.find(k => k.nik === nik && k.password === password);
    if (found) {
      setUser(found);
      localStorage.setItem('current_user', JSON.stringify(found));
      return { success: true, user: found };
    }
    return { success: false, message: 'NIK atau Password salah' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
  };

  const getJadwalByNik = (nik) => jadwal.filter(j => j.nik === nik);

  const getJadwalToday = (nik) => {
    const today = new Date().toISOString().split('T')[0];
    return jadwal.find(j => j.nik === nik && j.tanggal === today) || null;
  };

  const getShiftById = (id) => shifts.find(s => s.id === id) || null;

  const getAbsensiToday = (nik) => {
    const today = new Date().toISOString().split('T')[0];
    return absensi.find(a => a.nik === nik && a.tanggal === today) || null;
  };

  const absenMasuk = (nik, foto, lat, lng) => {
    const today = new Date().toISOString().split('T')[0];
    const jadwalHari = getJadwalToday(nik);

    if (!jadwalHari || jadwalHari.status === 'Libur') {
      return { success: false, message: 'Anda tidak terjadwal kerja hari ini' };
    }

    const existing = absensi.find(a => a.nik === nik && a.tanggal === today);
    if (existing && existing.jam_masuk) {
      return { success: false, message: 'Anda sudah melakukan absen masuk hari ini' };
    }

    const shift = getShiftById(jadwalHari.shift_id);
    const now = new Date();
    const jam = now.toTimeString().slice(0, 5);
    const jamMasukShift = shift?.jam_masuk || '08:00';
    const [hS, mS] = jamMasukShift.split(':').map(Number);
    const [hN, mN] = jam.split(':').map(Number);
    const selisihMenit = (hN * 60 + mN) - (hS * 60 + mS);
    const status_masuk = selisihMenit > 15 ? 'Terlambat' : 'Tepat Waktu';

    const newAbsensi = {
      id: `ABS-${nik}-${today}`,
      nik, tanggal: today,
      jam_masuk: jam,
      foto_masuk: foto,
      lat_masuk: lat, lng_masuk: lng,
      status_masuk,
      jam_pulang: null, foto_pulang: null,
      lat_pulang: null, lng_pulang: null,
      status_pulang: null,
    };

    const updated = absensi.filter(a => !(a.nik === nik && a.tanggal === today));
    saveAbsensi([...updated, newAbsensi]);
    return { success: true, message: `Absen masuk berhasil! Status: ${status_masuk}` };
  };

  const absenPulang = (nik, foto, lat, lng) => {
    const today = new Date().toISOString().split('T')[0];
    const existing = absensi.find(a => a.nik === nik && a.tanggal === today);

    if (!existing || !existing.jam_masuk) {
      return { success: false, message: 'Anda belum melakukan absen masuk hari ini' };
    }
    if (existing.jam_pulang) {
      return { success: false, message: 'Anda sudah melakukan absen pulang hari ini' };
    }

    const jam = new Date().toTimeString().slice(0, 5);
    const updated = absensi.map(a =>
      a.nik === nik && a.tanggal === today
        ? { ...a, jam_pulang: jam, foto_pulang: foto, lat_pulang: lat, lng_pulang: lng, status_pulang: 'Selesai' }
        : a
    );
    saveAbsensi(updated);
    return { success: true, message: 'Absen pulang berhasil!' };
  };

  const ajukanTukarShift = (data) => {
    const newReq = {
      id: `TS-${Date.now()}`,
      ...data,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };
    const updated = [...tukarShift, newReq];
    saveTukarShift(updated);
    return { success: true };
  };

  const ajukanTukarLibur = (data) => {
    const newReq = {
      id: `TL-${Date.now()}`,
      ...data,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };
    const updated = [...tukarLibur, newReq];
    saveTukarLibur(updated);
    return { success: true };
  };

  const approveTukarShift = (id, action, catatan = '') => {
    const req = tukarShift.find(t => t.id === id);
    if (!req) return;

    const updated = tukarShift.map(t =>
      t.id === id ? { ...t, status: action === 'approve' ? 'Approved' : 'Rejected', catatan, approved_at: new Date().toISOString() } : t
    );
    saveTukarShift(updated);

    if (action === 'approve') {
      // Swap jadwal
      const j1 = jadwal.find(j => j.nik === req.nik_pemohon && j.tanggal === req.tanggal_pemohon);
      const j2 = jadwal.find(j => j.nik === req.nik_tujuan && j.tanggal === req.tanggal_tujuan);
      if (j1 && j2) {
        const updatedJadwal = jadwal.map(j => {
          if (j.nik === req.nik_pemohon && j.tanggal === req.tanggal_pemohon) {
            return { ...j, shift_id: j2.shift_id, status: j2.shift_id ? 'Kerja' : 'Libur' };
          }
          if (j.nik === req.nik_tujuan && j.tanggal === req.tanggal_tujuan) {
            return { ...j, shift_id: j1.shift_id, status: j1.shift_id ? 'Kerja' : 'Libur' };
          }
          return j;
        });
        saveJadwal(updatedJadwal);
      }
    }
  };

  const approveTukarLibur = (id, action, catatan = '') => {
    const req = tukarLibur.find(t => t.id === id);
    if (!req) return;

    const updated = tukarLibur.map(t =>
      t.id === id ? { ...t, status: action === 'approve' ? 'Approved' : 'Rejected', catatan, approved_at: new Date().toISOString() } : t
    );
    saveTukarLibur(updated);

    if (action === 'approve') {
      // Swap libur: tanggal_libur_lama jadi Kerja, tanggal_libur_baru jadi Libur
      const j1 = jadwal.find(j => j.nik === req.nik && j.tanggal === req.tanggal_libur_lama);
      const j2 = jadwal.find(j => j.nik === req.nik && j.tanggal === req.tanggal_libur_baru);
      if (j1 && j2) {
        const updatedJadwal = jadwal.map(j => {
          if (j.nik === req.nik && j.tanggal === req.tanggal_libur_lama) {
            // Hari libur lama menjadi hari kerja (gunakan shift dari hari kerja lainnya)
            const shiftDefault = shifts[0]?.id || 'S1';
            return { ...j, shift_id: shiftDefault, status: 'Kerja' };
          }
          if (j.nik === req.nik && j.tanggal === req.tanggal_libur_baru) {
            return { ...j, shift_id: null, status: 'Libur' };
          }
          return j;
        });
        saveJadwal(updatedJadwal);
      }
    }
  };

  const tambahKaryawan = (data) => {
    const updated = [...karyawan, data];
    saveKaryawan(updated);
  };

  const updateKaryawan = (nik, data) => {
    const updated = karyawan.map(k => k.nik === nik ? { ...k, ...data } : k);
    saveKaryawan(updated);
  };

  const hapusKaryawan = (nik) => {
    const updated = karyawan.filter(k => k.nik !== nik);
    saveKaryawan(updated);
  };

  const tambahShift = (data) => {
    const updated = [...shifts, data];
    saveShifts(updated);
  };

  const updateShift = (id, data) => {
    const updated = shifts.map(s => s.id === id ? { ...s, ...data } : s);
    saveShifts(updated);
  };

  const hapusShift = (id) => {
    const updated = shifts.filter(s => s.id !== id);
    saveShifts(updated);
  };

  const updateJadwal = (id, data) => {
    const updated = jadwal.map(j => j.id === id ? { ...j, ...data } : j);
    saveJadwal(updated);
  };

  const tambahJadwal = (data) => {
    const updated = [...jadwal, data];
    saveJadwal(updated);
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      karyawan, tambahKaryawan, updateKaryawan, hapusKaryawan,
      shifts, tambahShift, updateShift, hapusShift,
      jadwal, tambahJadwal, updateJadwal,
      absensi,
      tukarShift, tukarLibur,
      getJadwalByNik, getJadwalToday, getShiftById, getAbsensiToday,
      absenMasuk, absenPulang,
      ajukanTukarShift, ajukanTukarLibur,
      approveTukarShift, approveTukarLibur,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
