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
        
        // 3. 노이즈 제거를 위한 가우시안 블러
        let blurred = new cvObject.Mat();
        cvObject.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
        
        // 4. 캐니 엣지 검출
        let edges = new cvObject.Mat();
        cvObject.Canny(blurred, edges, 50, 150);
        
        // 5. 윤곽선 검출
        let contours = new cvObject.MatVector();
        let hierarchy = new cvObject.Mat();
        cvObject.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        alert('1');
        // 6. 번호판 후보 필터링
        let plateContours = [];
        for (let i = 0; i < contours.size(); ++i) {
          let cnt = contours.get(i);
          let area = cvObject.contourArea(cnt);
          
          // 면적으로 1차 필터링
          if (area > 1000 && area < 50000) {
            // 근사 다각형 생성
            let perimeter = cvObject.arcLength(cnt, true);
            let approx = new cvObject.Mat();
            cvObject.approxPolyDP(cnt, approx, 0.02 * perimeter, true);
            
            alert('2');
            // 사각형 형태 확인 (4개의 꼭지점)
            if (approx.rows === 4) {
              let rect = cvObject.minAreaRect(cnt);
              let aspectRatio = rect.size.width / rect.size.height;
              alert('3');
              // 번호판 비율 확인 (한국 번호판 비율: 약 2.3:1 ~ 3.5:1)
              if ((aspectRatio > 2.3 && aspectRatio < 3.5) || 
                  (1/aspectRatio > 2.3 && 1/aspectRatio < 3.5)) {
                alert('4');
                plateContours.push({
                  contour: cnt,
                  rect: rect,
                  area: area
                });
              }
            }
            approx.delete();
          }
        }
        
        // 7. 가장 적합한 번호판 후보 선택 (면적이 큰 순서로)
        plateContours.sort((a, b) => b.area - a.area);
        
        for (let plateCandidate of plateContours) {
          let rect = plateCandidate.rect;
          
          // 회전된 사각형의 4개 꼭지점 구하기
          let rotatedRect = new cv.RotatedRect(rect.center, rect.size, rect.angle);
          let vertices = cv.Point2f.createVector(4);
          rotatedRect.points(vertices);
          
          // 회전 보정을 위한 변환 행렬 계산
          let angle = rect.angle;
          if (rect.size.width < rect.size.height) {
            angle = 90 + angle;
          }
          
          let rotMat = cv.getRotationMatrix2D(rect.center, angle, 1.0);
          let rotated = new cv.Mat();
          let size = new cv.Size(src.cols, src.rows);
          cv.warpAffine(src, rotated, rotMat, size);
          
          // 회전된 이미지에서 번호판 영역 추출
          let extractWidth = rect.size.width;
          let extractHeight = rect.size.height;
          if (rect.size.width < rect.size.height) {
            [extractWidth, extractHeight] = [extractHeight, extractWidth];
          }
          
          let plateRegion = rotated.roi(new cv.Rect(
            rect.center.x - extractWidth/2,
            rect.center.y - extractHeight/2,
            extractWidth,
            extractHeight
          ));
          
          // OCR을 위한 전처리
          let tempCanvas = document.createElement('canvas');
          cv.imshow(tempCanvas, plateRegion);
          
          // Tesseract OCR 수행
          Tesseract.recognize(
            tempCanvas,
            'kor',
            { 
              logger: m => console.log('OCR Progress:', m),
              tessedit_char_whitelist: '0123456789가나다라마바사아자차카타파하',
              tessedit_pageseg_mode: '7',  // 단일 텍스트 라인 모드
              tessedit_ocr_engine_mode: '0' // Legacy Tesseract 엔진
            }
          ).then(({ data: { text } }) => {
            // 정규표현식으로 번호판 형식 검증
            const platePattern = /\d{2,3}[가-힣]\d{4}/;
            const cleanText = text.replace(/[^0-9가-힣]/g, '');
            
            if (platePattern.test(cleanText)) {
              setDetectedPlate(cleanText);
              if (cleanText.includes(expectedPlateNumber)) {
                alert('일치하는 번호판 발견!');
                stopCamera();
                navigate('/driveing');
              }
            }
          });
          
          // 메모리 해제
          plateRegion.delete();
          rotated.delete();
          rotMat.delete();
        }
        
        // 결과 표시
        cv.imshow(canvasRef.current, src);
        
        // 메모리 해제
        src.delete();
        gray.delete();
        blurred.delete();
        edges.delete();
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