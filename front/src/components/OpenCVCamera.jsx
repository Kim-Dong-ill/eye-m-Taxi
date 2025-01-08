import React, { useEffect, useRef, useState } from 'react';
import '../css/components/openCVCamera.scss';

function OpenCVCamera({ onPlateDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

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
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      // 비디오 프레임 처리 시작
      requestAnimationFrame(processVideo);
    } catch (err) {
      console.error('카메라 접근 오류:', err);
    }
  };

  const processVideo = () => {
    if (!isLoaded || !videoRef.current || !canvasRef.current) return;

    const cv = window.cv;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 비디오 프레임을 캔버스에 그리기
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // 캔버스에서 이미지 데이터 가져오기
      let src = cv.imread(canvas);
      
      // 그레이스케일 변환
      let gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      // 가우시안 블러 적용
      let blurred = new cv.Mat();
      cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

      // Canny 엣지 검출
      let edges = new cv.Mat();
      cv.Canny(blurred, edges, 50, 150);

      // 윤곽선 찾기
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      // 번호판 후보 영역 찾기
      for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        let area = cv.contourArea(cnt);
        
        // 특정 크기 이상의 사각형 영역만 검사
        if (area > 1000) {
          let rect = cv.boundingRect(cnt);
          let aspectRatio = rect.width / rect.height;
          
          // 번호판의 일반적인 종횡비(가로/세로 비율) 검사
          if (aspectRatio > 2 && aspectRatio < 5) {
            cv.rectangle(src, 
              new cv.Point(rect.x, rect.y),
              new cv.Point(rect.x + rect.width, rect.y + rect.height),
              new cv.Scalar(255, 0, 0), 2);
              
            // 번호판 영역 감지 시 콜백 호출
            onPlateDetected && onPlateDetected(rect);
          }
        }
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

    // 다음 프레임 처리
    requestAnimationFrame(processVideo);
  };

  return (
    <div className="opencv-camera">
      <video 
        ref={videoRef} 
        style={{ display: 'none' }}
        width="640" 
        height="480"
      />
      <canvas 
        ref={canvasRef}
        width="640"
        height="480"
      />
      {!isLoaded && <div className="loading">OpenCV 로딩 중...</div>}
    </div>
  );
}

export default OpenCVCamera;