import React, { useRef, useEffect, useState } from 'react';
import '../css/components/cameraScanner.scss';

function CameraScanner({ expectedPlateNumber, onScanComplete }) {
    console.log(expectedPlateNumber);
    
  const videoRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } // 후면 카메라 사용
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsScanning(true);
      } catch (err) {
        console.error("카메라 접근 오류:", err);
      }
    };

    startCamera();

    // 컴포넌트 언마운트 시 카메라 정리
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="camera-scanner">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline
        className="camera-preview"
      />
      <div className="scanning-overlay">
        <div className="scan-area"></div>
        <p className="scan-text">번호판을 스캔해주세요</p>
      </div>
    </div>
  );
}

export default CameraScanner;