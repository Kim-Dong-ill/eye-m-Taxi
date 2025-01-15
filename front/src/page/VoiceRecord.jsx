import React, { useState } from "react";
import "../css/voiceRecord.scss";
import Mice from "../../public/icon/Microphone.svg";
import SpeechKit from "@mastashake08/speech-kit";
import { useLocation, useNavigate } from "react-router-dom";

function VoiceRecord() {
  const [speechKit, setSpeechKit] = useState(null);
  const [isRecording, setIsRecording] = useState(false); // 녹음 상태를 추적하는 state 추가
  const [recordedText, setRecordedText] = useState(""); // 음성 인식 텍스트를 저장할 state 추가
  const location = useLocation();
  const locationType = new URLSearchParams(location.search).get("type");
  const navigate = useNavigate();

  React.useEffect(() => {
    checkBrowserSupport();
  }, []);

  const checkBrowserSupport = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert(
        "이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해주세요."
      );
      navigate(-1);
      return;
    }
    initializeSpeechKit();
  };

  // SpeechKit 인스턴스를 생성합니다
  const initializeSpeechKit = () => {
    const options = {
      continuous: true, // 음성 인식을 지속적으로 수행
      interimResults: true, // 중간 결과를 반환
      pitch: 1.2, // 음성의 높이
      rate: 1.0, // 음성의 속도
    };

    const kit = new SpeechKit(options);

    // 마이크 사용 권한 없을 때 처리
    kit.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        alert("마이크 사용 권한이 필요합니다.");
        navigate(-1);
      }
    };

    // 음성 인식 결과를 처리하는 이벤트 리스너 추가
    kit.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      // console.log('인식된 텍스트:', transcript);
      setRecordedText(transcript); // 인식된 텍스트를 state에 저장
    };

    setSpeechKit(kit);
  };

  const handleVoiceRecord = () => {
    if (!speechKit) return;

    if (!isRecording) {
      console.log("녹음 시작");
      speechKit.recognition.start();
      setIsRecording(true);
    } else {
      console.log("녹음 중지");
      speechKit.recognition.stop();
      setIsRecording(false);
      if (recordedText !== "") {
        navigate(
          `/voiceRecordList/${encodeURIComponent(
            recordedText
          )}?type=${locationType}`,
          {
            state: location.state, // 현재의 state(승하차 정보)를 그대로 전달
          }
        );
      }
    }
  };

  return (
    <div className="voiceRecord">
      <img
        src={Mice}
        onClick={handleVoiceRecord}
        className={isRecording === true ? "recording" : ""}
      />
      {isRecording && <div className="recordingText" style={{fontSize: "64px",fontWeight:"bold"}}>듣는 중...</div>}
      <div className="recorded-text">
        {recordedText && <p>"{recordedText}"</p>}
      </div>
    </div>
  );
}

export default VoiceRecord;
