import React, { useEffect, useState } from "react";
import Button from "../components/button";
import Map from "../components/Map";
import sound from "/icon/sound.svg";
import call from "/icon/call.svg";
import OpenCVCamera from '../components/OpenCVCamera';

import "../css/callAccept.scss";
import { useNavigate } from "react-router-dom";

function CallAccept() {

  // 랜덤 차량번호 생성
  const generateRandomCarNumber = () => {
    const numbers = Math.floor(Math.random() * 9000 + 1000); // 1000-9999 사이의 랜덤 숫자
    const chars = '가나다라마바사아자차카타파하';
    const randomChar = chars[Math.floor(Math.random() * chars.length)];
    return `${Math.floor(Math.random() * 99)}${randomChar} ${numbers}`;
  };

  const navigate = useNavigate();
  const [remainingMinutes, setRemainingMinutes] = useState(5);  // 초기값 5분으로 설정
  // const [carNumber] = useState(generateRandomCarNumber());  // 차량번호를 컴포넌트 마운트 시 한 번만 생성
  const [carNumber] = useState("50바 6271");  // 차량번호를 컴포넌트 마운트 시 한 번만 생성
  const [showCamera, setShowCamera] = useState(false);

  // 카운트다운 효과 수정
  useEffect(() => {
    if (remainingMinutes <= 1) {
      setShowCamera(true); // 카메라 표시
    }

    const timer = setInterval(() => {
      setRemainingMinutes((prev) => {
        if (prev <= 3) clearInterval(timer);
        return prev - 2;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [remainingMinutes]);


  // 음성 합성 함수
  const handleSpeak = () => {
    try {
      if ('speechSynthesis' in window) {        
        const message = `${remainingMinutes}분 뒤 도착 예정`;
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'ko-KR';
        window.speechSynthesis.speak(utterance);
      } else {
        console.log('이 브라우저는 음성 합성을 지원하지 않습니다.');
      }
    } catch (error) {
      console.error('음성 합성 중 오류가 발생했습니다:', error);
    }
  };

  // 전화 걸기 함수 추가
  const handleCall = () => {
    window.location.href = 'tel:01012345678'; // 실제 기사님 전화번호로 변경하세요
  };

  const height = 400;

  const btnData = [
    {
      text: carNumber,
      link: "",
      disabled: true,
    },
    {
      text: `${remainingMinutes}분 뒤 도착 예정`,
      link: "",
      disabled: true,
    },
  ];

  return (
    <div className="callAccept">
    {showCamera ? (
      <OpenCVCamera 
        expectedPlateNumber={carNumber}
        onPlateDetected={(rect) => {
          // 번호판 영역이 감지되면 처리
          console.log('번호판 영역 감지:', rect);
          // 여기서 번호판 인식이 완료되면 driving 페이지로 이동
          navigate("/driveing");
        }}
      />
    ) : (
      <>
        <Map height={height} />
        <div className="buttons">
          {btnData.map((btn, index) => (
            <Button key={index} btnData={btn} />
          ))}
        </div>
        <div className="icons">
          <button className="icon-button" onClick={handleSpeak}>
            <img src={sound} alt="speaker" />
          </button>
          <button className="icon-button" onClick={handleCall}>
            <img src={call} alt="phone" />
          </button>
        </div>
      </>
    )}
  </div>
  );
}

export default CallAccept;
