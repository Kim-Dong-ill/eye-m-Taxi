import React, { useEffect, useRef, useState } from 'react';
import '../css/components/openCVCamera.scss';
import axios from 'axios';

function OpenCVCamera({ expectedPlateNumber, onPlateDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedPlate, setDetectedPlate] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const [matchedPlates, setMatchedPlates] = useState([]);
  const [plateBox, setPlateBox] = useState(null);  // 박스 좌표 상태 추가

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 15 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          processVideo();
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      alert('카메라 접근 오류: ' + err.message);
    }
  };

  const processVideo = async () => {
    if (isProcessing || !videoRef.current || !canvasRef.current) {
      requestAnimationFrame(processVideo);
      return;
    }
    
    try {
      setIsProcessing(true);

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
       
      const response = await axios.post(`${import.meta.env.VITE_PYTHON_SERVER_URL}/detect_plate`, {
        image: imageData
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30초 타임아웃 설정
      });
            
      if (response.data.success) {
        const { plate_number, confidence, plate_box } = response.data;


        // 번호판 문자열 정규화 (공백 제거)
        const normalizedDetected = plate_number.replace(/\s+/g, '');
        const normalizedExpected = expectedPlateNumber.replace(/\s+/g, '');

        setDetectedPlate(plate_number);
        setConfidence(confidence);
        setPlateBox(plate_box);
        
        // 신뢰도 70% 이상 체크 (백엔드에서 받은 원래 값 사용)
        if (confidence > 0.6) {
          setScanCount(prev => prev + 1);
          setMatchedPlates(prev => [...prev, normalizedDetected]);
            
          if (plate_number.includes(expectedPlateNumber)) {
            onPlateDetected(plate_number);
            stopCamera();
            return;
          }
        }
      }
      
    } catch (error) {
      console.error('Processing error:', error.response?.data || error.message);
      console.error('Full error:', error);
    } finally {
      setIsProcessing(false);
      requestAnimationFrame(processVideo);
    }
  };

  const findMostCommon = (arr) => {
    return arr.sort((a,b) =>
      arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // 번호판 박스 렌더링 함수
  const renderPlateBox = () => {
    if (!plateBox) return null;
    
    return (
      <div className="plate-box">
        {plateBox.map((point, index) => (
          <div
            key={index}
            className="box-point"
            style={{
              left: `${point[0] * 100}%`,
              top: `${point[1] * 100}%`
            }}
          />
        ))}
      </div>
    );
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
      {renderPlateBox()}  {/* 번호판 박스 렌더링 */}
      <div className="scanning-overlay">
        <div className="scan-area">
          <div className="corner top-left"></div>
          <div className="corner top-right"></div>
          <div className="corner bottom-left"></div>
          <div className="corner bottom-right"></div>
        </div>
        <p className="scan-text">
          {detectedPlate 
            ? `인식된 번호판: ${detectedPlate} (신뢰도: ${Math.round(confidence * 100)}%)`
            : '번호판을 스캔 영역 안에 맞춰주세요'}
        </p>
      </div>
      {isProcessing && (
        <div className="processing-indicator">
          <div className="spinner"></div>
          <span>처리 중...</span>
        </div>
      )}
    </div>
  );
}

export default OpenCVCamera;