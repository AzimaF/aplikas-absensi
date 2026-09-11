// Seed data for Online Attendance System
export const DIVISI = ['IT', 'Finance', 'Marketing', 'HR'];

export const SHIFTS = [
  { id: 'S1', nama: 'Shift Pagi', jam_masuk: '08:00', jam_pulang: '16:00', warna: '#6C63FF' },
  { id: 'S2', nama: 'Shift Siang', jam_masuk: '14:00', jam_pulang: '22:00', warna: '#FF6B6B' },
  { id: 'S3', nama: 'Shift Malam', jam_masuk: '22:00', jam_pulang: '06:00', warna: '#4ECDC4' },
];

export const KARYAWAN_SEED = [
  { nik: 'EMP001', nama: 'Budi Santoso', email: 'budi@company.com', password: 'password123', divisi: 'IT', jabatan: 'Software Engineer', role: 'karyawan' },
  { nik: 'EMP002', nama: 'Siti Rahayu', email: 'siti@company.com', password: 'password123', divisi: 'IT', jabatan: 'QA Engineer', role: 'karyawan' },
  { nik: 'EMP003', nama: 'Ahmad Fauzi', email: 'ahmad@company.com', password: 'password123', divisi: 'Finance', jabatan: 'Accountant', role: 'karyawan' },
  { nik: 'EMP004', nama: 'Maya Putri', email: 'maya@company.com', password: 'password123', divisi: 'Marketing', jabatan: 'Marketing Specialist', role: 'karyawan' },
  { nik: 'EMP005', nama: 'Dedi Kurniawan', email: 'dedi@company.com', password: 'password123', divisi: 'Finance', jabatan: 'Financial Analyst', role: 'karyawan' },
  { nik: 'EMP006', nama: 'Rina Marlina', email: 'rina@company.com', password: 'password123', divisi: 'Marketing', jabatan: 'Content Creator', role: 'karyawan' },
  { nik: 'DIV001', nama: 'Rini Kusuma', email: 'rini@company.com', password: 'password123', divisi: 'IT', jabatan: 'IT Manager', role: 'kadiv' },
  { nik: 'DIV002', nama: 'Hendra Wijaya', email: 'hendra@company.com', password: 'password123', divisi: 'Finance', jabatan: 'Finance Manager', role: 'kadiv' },
  { nik: 'DIV003', nama: 'Lestari Handayani', email: 'lestari@company.com', password: 'password123', divisi: 'Marketing', jabatan: 'Marketing Manager', role: 'kadiv' },
  { nik: 'ADM001', nama: 'Andi Pratama', email: 'andi@company.com', password: 'password123', divisi: 'HR', jabatan: 'HR Manager', role: 'admin' },
];

function generateJadwal() {
  const jadwal = [];
  const today = new Date();

  const pola = {
    EMP001: ['S1', 'S1', 'S1', 'S1', 'S1', null, null],
    EMP002: ['S2', 'S2', 'S2', 'S2', 'S2', null, null],
    EMP003: ['S1', 'S1', 'S1', 'S1', 'S1', null, null],
    EMP004: ['S1', 'S1', 'S1', 'S1', 'S1', null, null],
    EMP005: ['S2', 'S2', 'S2', 'S2', 'S2', null, null],
    EMP006: ['S1', 'S1', 'S1', 'S1', 'S1', null, null],
    DIV001: ['S1', 'S1', 'S1', 'S1', 'S1', null, null],
    DIV002: ['S1', 'S1', 'S1', 'S1', 'S1', null, null],
    DIV003: ['S1', 'S1', 'S1', 'S1', 'S1', null, null],
  };

  const niks = Object.keys(pola);

  for (let i = -7; i <= 30; i++) {
    const tgl = new Date(today);
    tgl.setDate(today.getDate() + i);
    const tanggal = tgl.toISOString().split('T')[0];
    const dayOfWeek = tgl.getDay(); // 0=Sun, 6=Sat

    niks.forEach(nik => {
      const shift_id = pola[nik][dayOfWeek === 0 ? 6 : dayOfWeek - 1];
      jadwal.push({
        id: `${nik}-${tanggal}`,
        nik,
        tanggal,
        shift_id: shift_id || null,
        status: shift_id ? 'Kerja' : 'Libur',
      });
    });
  }

  return jadwal;
}

export function seedLocalStorage() {
  if (!localStorage.getItem('karyawan_seeded')) {
    localStorage.setItem('karyawan', JSON.stringify(KARYAWAN_SEED));
    localStorage.setItem('shifts', JSON.stringify(SHIFTS));
    localStorage.setItem('jadwal', JSON.stringify(generateJadwal()));
    localStorage.setItem('absensi', JSON.stringify([]));
    localStorage.setItem('tukar_shift', JSON.stringify([]));
    localStorage.setItem('tukar_libur', JSON.stringify([]));
    localStorage.setItem('karyawan_seeded', 'true');
  }
}
