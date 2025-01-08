import React, { useEffect, useRef, useState } from 'react';
import '../css/components/openCVCamera.scss';
import Tesseract from 'tesseract.js';
import { useNavigate } from 'react-router-dom';


function OpenCVCamera({ expectedPlateNumber, onPlateDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [detectedPlate, setDetectedPlate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();


  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setHasCamera(false);
      alert("카메라 종료");
    }
  };

  useEffect(() => {
    const waitForOpenCV = () => {
      if (window.cv) {
        setIsLoaded(true);
        startCamera(true);
        alert('OpenCV 로딩 완료');
      } else {
        alert('OpenCV 로딩 중...');
        setTimeout(waitForOpenCV, 500);
      }
    };
    waitForOpenCV();

    return () => stopCamera();
  }, []);

  const startCamera = async (isLoaded) => {
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
          alert('카메라 시작');
          requestAnimationFrame(() => processVideo(isLoaded, true));
        };
      }
    } catch (err) {
      console.error('카메라 접근 오류:', err);
      alert('카메라 접근 오류:'+ err);
      setHasCamera(false);
    }
  };

  const processVideo = (isLoaded, hasCamera) => {
    if (isLoaded && hasCamera && videoRef.current && canvasRef.current) {
      try {
        const cv = window.cv;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
  
        // 캔버스 크기를 비디오 크기에 맞춤
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // 비디오 프레임을 캔버스에 그리기
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
        // Mat 객체 생성
        let src = cv.imread(canvasRef.current);
        let gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  
        // 이미지 전처리
        let blurred = new cv.Mat();
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
        
        // 엣지 검출
        let edges = new cv.Mat();
        cv.Canny(blurred, edges, 100, 200);
  
        // 윤곽선 검출
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
  
        // 번호판 후보 영역 검출
        for (let i = 0; i < contours.size(); ++i) {
          let cnt = contours.get(i);
          let area = cv.contourArea(cnt);
          
          if (area > 5000 && area < 100000) {
            let rect = cv.boundingRect(cnt);
            let aspectRatio = rect.width / rect.height;
            
            if (aspectRatio > 2 && aspectRatio < 3) {
              alert('번호판 영역 감지!');
              
              let point1 = new cv.Point(rect.x, rect.y);
              let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
              cv.rectangle(src, point1, point2, [0, 255, 0, 255], 2);
  
              let plateRegion = src.roi(rect);
              let tempCanvas = document.createElement('canvas');
              cv.imshow(tempCanvas, plateRegion);
              
              Tesseract.recognize(
                tempCanvas,
                'kor',
                { logger: m => console.log('OCR Progress:', m) }
              ).then(({ data: { text } }) => {
                const cleanText = text.replace(/[^0-9가-힣]/g, '');
                alert('인식된 번호판: ' + cleanText);
                setDetectedPlate(cleanText);
                
                if (cleanText.includes(expectedPlateNumber)) {
                  alert('일치하는 번호판 발견!');
                  stopCamera();
                  navigate('/driveing');
                }
              });
  
              plateRegion.delete();
            }
          }
          cnt.delete();
        }
  
        // 결과를 캔버스에 표시
        cv.imshow(canvasRef.current, src);
  
        // 메모리 해제
        src.delete();
        gray.delete();
        blurred.delete();
        edges.delete();
        contours.delete();
        hierarchy.delete();
  
        // 다음 프레임 처리를 위한 재귀 호출
        requestAnimationFrame(() => processVideo(isLoaded, hasCamera));
      } catch (err) {
        alert('이미지 처리 오류: ' + err.message);
        // 에러가 발생해도 계속 다음 프레임 처리
        requestAnimationFrame(() => processVideo(isLoaded, hasCamera));
      }
    } else {
      // 조건이 충족되지 않아도 계속 다음 프레임 처리
      requestAnimationFrame(() => processVideo(isLoaded, hasCamera));
    }
  };

  return (
    <div className="opencv-camera">
    <video 
      ref={videoRef}
      playsInline
      autoPlay
      muted
      style={{ width: '100%', height: 'auto' }}
    />
    <canvas 
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0 }}
    />
    <div className="scanning-overlay">
      <div className="scan-area"></div>
      <p className="scan-text">
        {detectedPlate 
          ? `인식된 번호판: ${detectedPlate}`
          : '번호판을 비춰주세요'}
      </p>
    </div>
    {!isLoaded && <div className="loading">OpenCV 로딩 중...</div>}
    {!hasCamera && isLoaded && (
      <div className="error">카메라를 시작할 수 없습니다.</div>
    )}
  </div>
  );
}

export default OpenCVCamera;