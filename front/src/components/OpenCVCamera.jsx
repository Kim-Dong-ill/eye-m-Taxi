import React, { useEffect, useRef, useState } from 'react';
import '../css/components/openCVCamera.scss';

function OpenCVCamera({ onPlateDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    // OpenCV가 로드될 때까지 대기
    const waitForOpenCV = () => {
      if (window.cv) {
        setIsLoaded(true);
        startCamera();
      } else {
        setTimeout(waitForOpenCV, 500);
      }
    };
    waitForOpenCV();

    // 컴포넌트 언마운트 시 카메라 정리
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setHasCamera(true);
          // 비디오 프레임 처리 시작
          requestAnimationFrame(processVideo);
        };
      }
    } catch (err) {
      console.error('카메라 접근 오류:', err);
      setHasCamera(false);
    }
  };

  const processVideo = () => {
    if (!isLoaded || !videoRef.current || !canvasRef.current) return;
    if (!hasCamera) return;

    const cv = window.cv;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 비디오 크기에 맞게 캔버스 크기 조정
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 비디오 프레임을 캔버스에 그리기
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // ... 기존의 OpenCV 처리 코드 ...
    } catch (err) {
      console.error('이미지 처리 오류:', err);
    }

    // 다음 프레임 처리
    requestAnimationFrame(processVideo);
  };

  return (
    <div className="opencv-camera">
    <video 
      ref={videoRef}
      playsInline
      autoPlay
      muted
    />
    <canvas ref={canvasRef} />
    <div className="scanning-overlay">
      <div className="scan-area"></div>
      <p className="scan-text">번호판을 스캔해주세요</p>
    </div>
    {!isLoaded && <div className="loading">OpenCV 로딩 중...</div>}
    {!hasCamera && isLoaded && (
      <div className="error">
        카메라를 시작할 수 없습니다. 카메라 권한을 확인해주세요.
      </div>
    )}
  </div>
  );
}

export default OpenCVCamera;