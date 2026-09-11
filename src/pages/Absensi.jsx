import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout/Layout';
import CameraCapture from '../components/Camera/CameraCapture';
import Modal from '../components/common/Modal';

export default function Absensi() {
  const { user, getJadwalToday, getShiftById, getAbsensiToday, absenMasuk, absenPulang } = useApp();
  const [showCamera, setShowCamera] = useState(false);
  const [mode, setMode] = useState(''); // 'masuk' | 'pulang'
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [foto, setFoto] = useState(null);
  const [step, setStep] = useState(1); // 1=location, 2=camera, 3=confirm
  const [alert, setAlert] = useState(null);
  const [processing, setProcessing] = useState(false);

  const jadwalHari = getJadwalToday(user.nik);
  const shift = jadwalHari?.shift_id ? getShiftById(jadwalHari.shift_id) : null;
  const absenHari = getAbsensiToday(user.nik);

  const startAbsen = (m) => {
    setMode(m);
    setStep(1);
    setLocation(null);
    setFoto(null);
    setAlert(null);
    setShowCamera(true);
    getLocation();
  };

  const getLocation = () => {
    setLocLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocLoading(false);
          setStep(2);
        },
        () => {
          // If location denied, use mock location
          setLocation({ lat: -6.2088, lng: 106.8456 });
          setLocLoading(false);
          setStep(2);
        },
        { timeout: 8000 }
      );
    } else {
      setLocation({ lat: -6.2088, lng: 106.8456 });
      setLocLoading(false);
      setStep(2);
    }
  };

  const handleCapture = (dataUrl) => {
    setFoto(dataUrl);
    setStep(3);
  };

  const handleConfirm = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 800));

    let result;
    if (mode === 'masuk') {
      result = absenMasuk(user.nik, foto, location?.lat, location?.lng);
    } else {
      result = absenPulang(user.nik, foto, location?.lat, location?.lng);
    }

    setProcessing(false);
    setShowCamera(false);
    setAlert({ type: result.success ? 'success' : 'error', message: result.message });
    if (result.success) {
      setFoto(null);
      setLocation(null);
      setStep(1);
    }
  };

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const today = new Date();
  const todayStr = `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

  return (
    <Layout>
      <div className="animate-fadein">
        <div className="page-header">
          <h2>Absensi Harian</h2>
          <p>{todayStr}</p>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`} style={{ marginBottom: '1.5rem' }}>
            {alert.message}
          </div>
        )}

        {/* Jadwal Hari Ini */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title">Jadwal Hari Ini</h3>
            <span className={`badge ${jadwalHari?.status === 'Kerja' ? 'kerja' : 'libur'}`}>
              {jadwalHari?.status || 'Tidak ada jadwal'}
            </span>
          </div>

          {jadwalHari?.status === 'Libur' ? (
            <div className="alert alert-warning">
              Anda terjadwal libur hari ini. Absensi tidak dapat dilakukan pada hari libur.
            </div>
          ) : shift ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>SHIFT</div>
                <div style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{shift.nama}</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>JAM MASUK</div>
                <div style={{ fontWeight: 700, color: 'var(--success)' }}>{shift.jam_masuk}</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>JAM PULANG</div>
                <div style={{ fontWeight: 700, color: 'var(--danger)' }}>{shift.jam_pulang}</div>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning">Tidak ada jadwal kerja untuk hari ini.</div>
          )}
        </div>

        {/* Status Absensi */}
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          {/* Absen Masuk */}
          <div className="card glow">
            <div className="card-header">
              <h3 className="card-title">Absen Masuk</h3>
              {absenHari?.jam_masuk && <span className={`badge ${absenHari.status_masuk === 'Terlambat' ? 'terlambat' : 'tepat'}`}>{absenHari.status_masuk}</span>}
            </div>

            {absenHari?.jam_masuk ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                {absenHari.foto_masuk && (
                  <img src={absenHari.foto_masuk} alt="Foto masuk" style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 8, marginBottom: '0.75rem', border: '2px solid var(--success)' }} />
                )}
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>{absenHari.jam_masuk}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {absenHari.lat_masuk?.toFixed(4)}, {absenHari.lng_masuk?.toFixed(4)}
                </div>
                <div className="alert alert-success" style={{ marginTop: '1rem' }}>Absensi masuk sudah tercatat</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  Foto selfie + lokasi GPS diperlukan untuk absensi
                </p>
                <button
                  id="btn-start-absen-masuk"
                  className="btn btn-primary btn-lg"
                  disabled={jadwalHari?.status === 'Libur' || !jadwalHari}
                  onClick={() => startAbsen('masuk')}
                >
                  Mulai Absen Masuk
                </button>
              </div>
            )}
          </div>

          {/* Absen Pulang */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Absen Pulang</h3>
              {absenHari?.jam_pulang && <span className="badge approved">Selesai</span>}
            </div>

            {absenHari?.jam_pulang ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                {absenHari.foto_pulang && (
                  <img src={absenHari.foto_pulang} alt="Foto pulang" style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 8, marginBottom: '0.75rem', border: '2px solid var(--danger)' }} />
                )}
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)' }}>{absenHari.jam_pulang}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {absenHari.lat_pulang?.toFixed(4)}, {absenHari.lng_pulang?.toFixed(4)}
                </div>
                <div className="alert alert-success" style={{ marginTop: '1rem' }}>Absensi pulang sudah tercatat</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  {!absenHari?.jam_masuk ? 'Lakukan absen masuk terlebih dahulu' : 'Foto selfie + lokasi GPS diperlukan'}
                </p>
                <button
                  id="btn-start-absen-pulang"
                  className="btn btn-danger btn-lg"
                  disabled={!absenHari?.jam_masuk || !!absenHari?.jam_pulang}
                  onClick={() => startAbsen('pulang')}
                >
                  Mulai Absen Pulang
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Kamera */}
        <Modal
          isOpen={showCamera}
          onClose={() => setShowCamera(false)}
          title={`Absen ${mode === 'masuk' ? 'Masuk' : 'Pulang'}`}
          maxWidth="500px"
        >
          {/* Step indicators */}
          <div className="absensi-steps" style={{ marginBottom: '1.5rem' }}>
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
              <div className="step-circle">{step > 1 ? '✓' : '1'}</div>
              <span>Lokasi</span>
            </div>
            <div className="step-divider" />
            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
              <div className="step-circle">{step > 2 ? '✓' : '2'}</div>
              <span>Foto</span>
            </div>
            <div className="step-divider" />
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-circle">3</div>
              <span>Konfirmasi</span>
            </div>
          </div>

          {step === 1 && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
              {locLoading ? (
                <p className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Mendapatkan lokasi GPS...</p>
              ) : location ? (
                <>
                  <div className="alert alert-success">Lokasi berhasil didapatkan</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                  </div>
                </>
              ) : null}
            </div>
          )}

          {step === 2 && (
            <CameraCapture
              onCapture={handleCapture}
              onCancel={() => setShowCamera(false)}
            />
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '1rem' }}>
                <img src={foto} alt="Preview" style={{ width: '100%', maxWidth: 300, borderRadius: 12, border: '2px solid var(--primary)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                <div className="detail-box">
                  <div className="label">Waktu</div>
                  <div className="value">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="detail-box">
                  <div className="label">Lokasi</div>
                  <div className="value" style={{ fontSize: '0.75rem' }}>
                    {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button className="btn btn-outline" onClick={() => setStep(2)}>Ulangi Foto</button>
                <button
                  id="btn-submit-absen"
                  className="btn btn-success btn-lg"
                  onClick={handleConfirm}
                  disabled={processing}
                >
                  {processing ? 'Memproses...' : `Konfirmasi Absen ${mode === 'masuk' ? 'Masuk' : 'Pulang'}`}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
