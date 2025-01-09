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
      console.log('Sending request to:', import.meta.env.VITE_NODE_SERVER_URL);
      
      const response = await axios.post(`${import.meta.env.VITE_NODE_SERVER_URL}/detect_plate`, {
        image: imageData
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30초 타임아웃 설정
      });
      
      console.log('Server response:', response.data); // 응답 로깅
      
      if (response.data.success) {
        const { plate_number, confidence: plateConfidence } = response.data;
        console.log('Detected plate:', plate_number, 'confidence:', plateConfidence);
        setDetectedPlate(plate_number);
        setConfidence(plateConfidence);
        
        if (plateConfidence > 0.7) {
          setScanCount(prev => prev + 1);
          setMatchedPlates(prev => [...prev, plate_number]);
          
          if (matchedPlates.length >= 2) {
            const lastThreeScans = [...matchedPlates.slice(-2), plate_number];
            const mostCommon = findMostCommon(lastThreeScans);
            
            if (mostCommon.includes(expectedPlateNumber)) {
              onPlateDetected(mostCommon);
              stopCamera();
              return;
            }
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