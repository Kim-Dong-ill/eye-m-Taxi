import React, { useState } from 'react'
import '../css/voiceRecord.scss'
import Mice from '../../public/icon/Microphone.svg'
import SpeechKit from '@mastashake08/speech-kit'
import { useNavigate } from 'react-router-dom';

function VoiceRecord() {
  const [speechKit, setSpeechKit] = useState(null);
  const [isRecording, setIsRecording] = useState(false);  // 녹음 상태를 추적하는 state 추가
  const [recordedText, setRecordedText] = useState('');  // 음성 인식 텍스트를 저장할 state 추가

  const navigate = useNavigate();

  React.useEffect(() => {
    initializeSpeechKit();
  }, []);

   // SpeechKit 인스턴스를 생성합니다
   const initializeSpeechKit = () => {
    const options = {
      continuous: true,  // 음성 인식을 지속적으로 수행
      interimResults: true,  // 중간 결과를 반환
      pitch: 1.2,  // 음성의 높이
      rate: 1.0,  // 음성의 속도
    };

    const kit = new SpeechKit(options);

     // 음성 인식 결과를 처리하는 이벤트 리스너 추가
     kit.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      // console.log('인식된 텍스트:', transcript);
      setRecordedText(transcript);  // 인식된 텍스트를 state에 저장
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
      if(recordedText !== ''){
        navigate(`/voiceRecordList/${recordedText}`);
      }
    }
  };

  return (
    <div className='voiceRecord'>
      <img src={Mice} onClick={handleVoiceRecord}/>
      {isRecording && <div className='recordingText'>녹음 중...</div>}
      <div className="recorded-text">
        {recordedText && <p>"{recordedText}"</p>}
      </div>
    </div>
  )
}

export default VoiceRecord
