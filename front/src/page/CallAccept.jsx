import React, { useEffect, useState } from "react";
import Button from "../components/button";
import CallMap from "../components/CallMap";
import OpenCVCamera from '../components/OpenCVCamera';
import "../css/callAccept.scss";
import { useNavigate, useLocation } from "react-router-dom";
import SvgThema from '../components/SvgThema';
import { useTheme } from '../components/contain/ThemeContext'

function CallAccept() {
  const { themeColor } = useTheme()
  const navigate = useNavigate();
  const location = useLocation();
  const { pickup, dropoff} = location.state || {};
  if (!pickup || !dropoff) {
    return <div>경로 데이터를 불러오는 중입니다...</div>;
  }
  const [remainingMinutes, setRemainingMinutes] = useState(5);  // 초기값 5분으로 설정
  // const [carNumber] = useState(generateRandomCarNumber());  // 차량번호를 컴포넌트 마운트 시 한 번만 생성
  const [carNumber] = useState("123가4568");  // 차량번호를 컴포넌트 마운트 시 한 번만 생성
  const [showCamera, setShowCamera] = useState(false);

  const handleStartCamera=()=>{
    setShowCamera(true);
  }


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

  const test = () => {
    if(pickup && dropoff) {
      console.log("+==============",pickup, dropoff)
      navigate("/driveing", {state:{pickup, dropoff}})
    }
  }

  return (
    <div className="callAccept">
    {showCamera ? (
      <OpenCVCamera 
        expectedPlateNumber={carNumber}
        onPlateDetected={(rect) => {
          // 여기서 번호판 인식이 완료되면 driving 페이지로 이동
          navigate("/driveing");
        }}
      />
    ) : (
      <>
        <CallMap 
          height={height} 
          pickup={pickup} 
          dropoff={dropoff} 
          showTaxi={true}
          handleStartCamera={handleStartCamera}
        />
        <div className="buttons">
          {btnData.map((btn, index) => (
            <Button key={index} btnData={btn} />
          ))}
        </div>
        <div className="icons">
          <button className="icon-button" onClick={handleSpeak}>
            <SvgThema icon="SOUND_SVG" color={themeColor}/>
          </button>
          <button className="icon-button" onClick={handleCall}>
            <SvgThema icon="CALL_SVG" color={themeColor}/>
          </button>
        </div>
        <div onClick={test}>
          testButton
        </div>
      </>
    )}
  </div>
  );
}

export default CallAccept;
