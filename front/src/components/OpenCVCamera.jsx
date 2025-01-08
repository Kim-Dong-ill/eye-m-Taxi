import React, { useEffect, useRef, useState } from 'react';
import '../css/components/openCVCamera.scss';
import Tesseract from 'tesseract.js';
import { useNavigate } from 'react-router-dom';

let cvObject = null;

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
        cvObject = window.cv;
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
    if (!cvObject) {
      cvObject = window.cv;
    }
    if (isLoaded && hasCamera && videoRef.current && canvasRef.current) {
      try {
        if (!cvObject) {
          alert('OpenCV 객체를 찾을 수 없음');
          requestAnimationFrame(() => processVideo(isLoaded, hasCamera));
          return;
        }
        const cv = window.cv;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
        // 1. 원본 이미지 읽기
        let src = cvObject.imread(canvasRef.current);
        
        // 2. 그레이스케일 변환
        let gray = new cvObject.Mat();
        cvObject.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        
        // 3. 히스토그램 평활화로 대비 개선
        let equalized = new cvObject.Mat();
        cvObject.equalizeHist(gray, equalized);
        
        // 4. 가우시안 블러로 노이즈 제거
        let blurred = new cvObject.Mat();
        cvObject.GaussianBlur(equalized, blurred, new cv.Size(5, 5), 0);
        
        // 5. 적응형 이진화
        let binary = new cvObject.Mat();
        cvObject.adaptiveThreshold(blurred, binary, 255,
          cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);
        
        // 6. 모폴로지 연산으로 노이즈 제거 및 문자 영역 강화
        let kernel = cvObject.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
        let morphed = new cvObject.Mat();
        cvObject.morphologyEx(binary, morphed, cv.MORPH_CLOSE, kernel);
        
        // 7. 윤곽선 검출
        let contours = new cvObject.MatVector();
        let hierarchy = new cvObject.Mat();
        cvObject.findContours(morphed, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
        
        // 8. 번호판 후보 필터링
        for (let i = 0; i < contours.size(); ++i) {
          let cnt = contours.get(i);
          let area = cvObject.contourArea(cnt);
          
          // 면적 기준 필터링 (번호판 크기에 맞는 영역만 선택)
          if (area > 1000 && area < 50000) {
            // 윤곽선을 감싸는 최소 사각형 찾기
            let rect = cvObject.boundingRect(cnt);
            let aspectRatio = rect.width / rect.height;
            
            // 번호판의 일반적인 가로세로 비율 확인 (한국 번호판 비율 고려)
            if (aspectRatio > 2 && aspectRatio < 4) {
              // 기울기가 심하지 않은 것만 선택
              let minRect = cvObject.minAreaRect(cnt);
              let angle = minRect.angle;
              if (Math.abs(angle) < 20) {  // 20도 이하의 기울기만 허용
                
                // 사각형 그리기
                let point1 = new cvObject.Point(rect.x, rect.y);
                let point2 = new cvObject.Point(rect.x + rect.width, rect.y + rect.height);
                cvObject.rectangle(src, point1, point2, [0, 255, 0, 255], 2);
                
                // 번호판 영역 추출
                let plateRegion = src.roi(rect);
                
                // OCR을 위한 전처리
                let tempCanvas = document.createElement('canvas');
                cvObject.imshow(tempCanvas, plateRegion);
                
                // OCR 수행
                Tesseract.recognize(
                  tempCanvas,
                  'kor',
                  { 
                    logger: m => console.log('OCR Progress:', m),
                    tessedit_char_whitelist: '0123456789가나다라마바사아자차카타파하',
                    tessedit_pageseg_mode: '7'  // 단일 텍스트 라인 모드
                  }
                ).then(({ data: { text } }) => {
                  const cleanText = text.replace(/[^0-9가-힣]/g, '');
                  if (cleanText.length >= 7) {  // 일반적인 번호판 길이 확인
                    setDetectedPlate(cleanText);
                    if (cleanText.includes(expectedPlateNumber)) {
                      alert('일치하는 번호판 발견!');
                      stopCamera();
                      navigate('/driveing');
                    }
                  }
                });
  
                plateRegion.delete();
              }
            }
          }
          cnt.delete();
        }
  
        // 결과 표시
        cvObject.imshow(canvasRef.current, src);
  
        // 메모리 해제
        src.delete();
        gray.delete();
        equalized.delete();
        blurred.delete();
        binary.delete();
        morphed.delete();
        kernel.delete();
        contours.delete();
        hierarchy.delete();
  
        requestAnimationFrame(() => processVideo(isLoaded, hasCamera));
      } catch (err) {
        console.error('이미지 처리 오류:', err);
        requestAnimationFrame(() => processVideo(isLoaded, hasCamera));
      }
    } else {
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