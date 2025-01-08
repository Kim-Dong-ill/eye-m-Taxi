import React, { useEffect, useState } from 'react'
import TextBox from '../components/TextBox'
import Button from '../components/button'
import '../css/calling.scss'
import { useNavigate } from 'react-router-dom';
import CameraScanner from '../components/CameraScanner';

function Calling() {

  const navigate = useNavigate();
  const [distance, setDistance] = useState('1');
  const [showCamera, setShowCamera] = useState(false);
  const [carNumber, setCarNumber] = useState('');
  
// 랜덤 차량번호 생성 함수
const generateRandomCarNumber = () => {
  const numbers = Math.floor(Math.random() * 9000 + 1000);
  const chars = '가나다라마바사아자차카타파하';
  const randomChar = chars[Math.floor(Math.random() * chars.length)];
  return `${Math.floor(Math.random() * 99)}${randomChar}${numbers}`;
};

  useEffect(() => {
    const carNumber = generateRandomCarNumber();
    setCarNumber(carNumber); // 생성된 번호를 상태에 저장
    
    const timer2s = setTimeout(() => {
      setDistance('2');
    }, 2500);
    
    const timer5s = setTimeout(() => {
      setDistance('5');
    }, 7000);
    
    const timerNavigate = setTimeout(() => {
      setShowCamera(true); // 2.5초 후 카메라 표시
      // navigate(`/callAccept/${carNumber}`);
    }, 10000);

    // cleanup function
    return () => {
      clearTimeout(timer2s);
      clearTimeout(timer5s);
      clearTimeout(timerNavigate);
    };
  }, [navigate]);
  

  const text = [`최대 ${distance}분 거리에서`, `택시 호출중...`];
  const btnData = {
    text : "호출 취소하기",
    link : "/"
  }

  return (
    <div className='calling'>
    {showCamera ? (
      <CameraScanner 
      expectedPlateNumber={carNumber}
      onScanComplete={(isMatch) => {
          if (isMatch) {
            navigate('/callAccept');
          }
        }}
      />
    ) : (
      <>
        <TextBox 
          text={text.map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < text.length - 1 && <br />}
            </React.Fragment>
          ))}
        />
        <Button btnData={btnData}/>
      </>
    )}
  </div>
  )
}

export default Calling
