import React, { useRef, useState, useEffect } from 'react';

export default function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [captured, setCaptured] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      setLoading(true);
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.');
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCaptured(dataUrl);
    stopCamera();
  };

  const retake = () => {
    setCaptured(null);
    startCamera();
  };

  const confirm = () => {
    if (captured) {
      onCapture(captured);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {error ? (
        <div className="alert alert-error">{error}</div>
      ) : (
        <>
          {!captured ? (
            <div className="camera-container">
              {loading && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: '#000', color: '#fff', fontSize: '0.875rem'
                }}>
                  <span className="animate-pulse">🎥 Memuat kamera...</span>
                </div>
              )}
              <video ref={videoRef} autoPlay playsInline muted />
              <canvas ref={canvasRef} />
              <div className="camera-overlay">
                <button className="btn btn-primary" onClick={takePhoto} id="btn-take-photo">
                  📸 Ambil Foto
                </button>
              </div>
            </div>
          ) : (
            <div className="captured-photo">
              <img src={captured} alt="Foto absensi" />
            </div>
          )}
        </>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
        {captured ? (
          <>
            <button className="btn btn-outline" onClick={retake} id="btn-retake">
              Ulangi
            </button>
            <button className="btn btn-success" onClick={confirm} id="btn-confirm-photo">
              Gunakan Foto
            </button>
          </>
        ) : null}
        <button className="btn btn-outline" onClick={onCancel} id="btn-cancel-camera">
          Tutup
        </button>
      </div>
    </div>
  );
}
