import React, { useEffect } from 'react'
import CallMap from '../components/CallMap'
import Button from '../components/button'
import { useLocation, useNavigate } from 'react-router-dom';

function Driveing() {

  const navigate = useNavigate();
  const location = useLocation();
  const { pickup, dropoff } = location.state || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      // navigate('/driveFinish');
    }, 10000); // 10초 후 이동

    // 컴포넌트가 언마운트될 때 타이머 정리
    return () => clearTimeout(timer);
  }, [navigate]);

  const height = 600;
  const btnData ={
    text : "도착까지 1분",
    link : ""
  }

     // pickup과 dropoff가 없는 경우 처리
     if (!pickup || !dropoff) {
      return <div>경로 데이터를 불러오는 중입니다...</div>;
    }

  return (
    <div className='callPreview'>
      <CallMap 
      height={height}
      pickup={pickup}
      dropoff={dropoff}
       /> {/* 경로가 있으면 지도 표시 */}
      <Button btnData={btnData}/>
    </div>
  )
}

export default Driveing
