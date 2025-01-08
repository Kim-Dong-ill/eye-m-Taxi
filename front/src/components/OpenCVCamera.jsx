import React, { useEffect, useRef, useState } from 'react';
import '../css/components/openCVCamera.scss';
import Tesseract from 'tesseract.js';
import { useNavigate } from 'react-router-dom';


function OpenCVCamera({ expectedPlateNumber, onPlateDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const navigate = useNavigate();


  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setHasCamera(false);
    }
  };

  useEffect(() => {
    const waitForOpenCV = () => {
      if (window.cv) {
        setIsLoaded(true);
        startCamera();
      } else {
        setTimeout(waitForOpenCV, 500);
      }
    };
    waitForOpenCV();

    return () => stopCamera();
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
          requestAnimationFrame(processVideo);
        };
      }
    } catch (err) {
      console.error('카메라 접근 오류:', err);
      setHasCamera(false);
    }
  };

  const processVideo = () => {
    if (!isLoaded || !videoRef.current || !canvasRef.current || !hasCamera) return;

    const cv = window.cv;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      let src = cv.imread(canvas);
      let gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      // 노이즈 제거 및 이미지 개선
      let blurred = new cv.Mat();
      cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
      
      // 엣지 검출 파라미터 조정
      let edges = new cv.Mat();
      cv.Canny(blurred, edges, 100, 200);

      // 윤곽선 찾기
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

      // 번호판 후보 영역 검출
      for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        let area = cv.contourArea(cnt);
        
        // 번호판 크기 범위 조정
        if (area > 5000 && area < 100000) {
          let rect = cv.boundingRect(cnt);
          let aspectRatio = rect.width / rect.height;
          
          // 번호판 비율 범위 조정
          if (aspectRatio > 1.5 && aspectRatio < 5) {
            // 감지된 영역 표시 (녹색 사각형)
            let point1 = new cv.Point(rect.x, rect.y);
            let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
            cv.rectangle(src, point1, point2, [0, 255, 0, 255], 3);

            // 번호판 영역 추출
            let plateRegion = src.roi(rect);
            
            // 번호판 이미지를 base64로 변환
            let tempCanvas = document.createElement('canvas');
            tempCanvas.width = rect.width;
            tempCanvas.height = rect.height;
            let tempCtx = tempCanvas.getContext('2d');
            let tempImg = new cv.Mat();
            cv.resize(plateRegion, tempImg, new cv.Size(rect.width, rect.height));
            cv.imshow(tempCanvas, tempImg);
            
            // Tesseract.js로 텍스트 인식
            Tesseract.recognize(
              tempCanvas.toDataURL(),
              'kor',
              { logger: m => console.log(m) }
            ).then(({ data: { text } }) => {
              // 숫자와 한글만 추출
              const cleanText = text.replace(/[^0-9가-힣]/g, '');
              console.log('인식된 번호판:', cleanText);
              setDetectedPlate(cleanText);

              // 예상 번호판과 일치하는지 확인
              if (cleanText.includes(expectedPlateNumber)) {
                stopCamera();
                navigate('/driveing');
              }
            });

            tempImg.delete();
            plateRegion.delete();
          }
        }
        cnt.delete();
      }

      // 결과 표시
      cv.imshow(canvas, src);

      // 메모리 해제
      src.delete();
      gray.delete();
      blurred.delete();
      edges.delete();
      contours.delete();
      hierarchy.delete();

    } catch (err) {
      console.error('이미지 처리 오류:', err);
    }

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
        <p className="scan-text">
          {detectedPlate 
            ? `인식된 번호판: ${detectedPlate}`
            : '번호판을 비춰주세요'}
        </p>
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