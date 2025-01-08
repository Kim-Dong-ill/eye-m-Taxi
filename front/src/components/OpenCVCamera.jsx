import React, { useEffect, useRef, useState } from 'react';
import '../css/components/openCVCamera.scss';

function OpenCVCamera({ onPlateDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);

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

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      let src = cv.imread(canvas);
      let gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      // 적응형 임계값 처리
      let binary = new cv.Mat();
      cv.adaptiveThreshold(gray, binary, 255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);

      // 윤곽선 찾기
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      cv.findContours(binary, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

      // 가능한 번호판 영역 검사
      for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        let area = cv.contourArea(cnt);
        
        // 적절한 크기의 영역만 검사
        if (area > 1000 && area < 50000) {
          let rect = cv.boundingRect(cnt);
          let aspectRatio = rect.width / rect.height;
          
          // 번호판의 일반적인 가로세로 비율 검사 (2:1 ~ 4:1)
          if (aspectRatio > 2 && aspectRatio < 4) {
            // 감지된 영역 표시
            let point1 = new cv.Point(rect.x, rect.y);
            let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
            cv.rectangle(src, point1, point2, [0, 255, 0, 255], 2);
            
            // 번호판 감지 콜백
            onPlateDetected && onPlateDetected(rect);
          }
        }
        cnt.delete();
      }

      // 결과 표시
      cv.imshow(canvas, src);

      // 메모리 해제
      src.delete();
      gray.delete();
      binary.delete();
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

        <p className="scan-text">번호판을 비춰주세요</p>
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