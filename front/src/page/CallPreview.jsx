import React, { useState, useEffect } from 'react'
import Button from '../components/button'
import '../css/callPreview.scss'
import { useLocation, useNavigate } from 'react-router-dom';
import CallMap from '../components/CallMap';

function CallPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pickup, dropoff } = location.state || {};

  console.log("승차 좌표", pickup?.coordinates);//승차 좌표 
  console.log("하차 좌표", dropoff?.coordinates);//하차 좌표

  // 로그로 확인
  console.log("location.state", location.state);
  console.log("pickup", pickup);
  console.log("dropoff", dropoff);

  // pickup과 dropoff가 없는 경우 처리
  if (!pickup || !dropoff) {
    return <div>경로 데이터를 불러오는 중입니다...</div>;
  }

  const height = 550;

  const handleNavigateToCalling = () => {
    console.log("-----------")
    navigate('/calling', {
      state: {
        pickup: pickup,  // pickup 좌표
        dropoff: dropoff // dropoff 좌표
      }
    });
  };

  const btnData = {
    text: "호출하기",
    link: "/calling",
    onClick: handleNavigateToCalling
  };

  return (
    <div className='callPreview'>
      <CallMap
        height={height}
        pickup={pickup}
        dropoff={dropoff}
      /> {/* 경로가 있으면 지도 표시 */}
      <Button btnData={btnData} />
    </div>
  )
}

export default CallPreview;
