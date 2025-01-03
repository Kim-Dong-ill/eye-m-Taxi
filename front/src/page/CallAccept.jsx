import React from "react";
import Button from "../components/button";
import Map from "../components/Map";
import sound from "../../public/icon/Sound.svg";
import call from "../../public/icon/Call.svg";

import "../css/callAccept.scss";

function CallAccept() {

  const generateRandomCarNumber = () => {
    const numbers = Math.floor(Math.random() * 9000 + 1000); // 1000-9999 사이의 랜덤 숫자
    const chars = '가나다라마바사아자차카타파하';
    const randomChar = chars[Math.floor(Math.random() * chars.length)];
    return `${Math.floor(Math.random() * 99)}${randomChar} ${numbers}`;
  };

  const handleSpeak = () => {
    try {
      if ('speechSynthesis' in window) {        
        const message = "3분 뒤 도착 예정";
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

  const height = 450;

  const btnData = [
    {
      text: generateRandomCarNumber(),
      link: "",
      disabled: true,
    },
    {
      text: "3분 뒤 도착 예정",
      link: "",
      disabled: true,
    },
  ];

  return (
    <div className="callAccept">
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
        <button className="icon-button">
          <img src={call} alt="phone" />
        </button>
      </div>
    </div>
  );
}

export default CallAccept;
