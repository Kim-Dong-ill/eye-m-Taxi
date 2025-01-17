import React, { useState, useEffect } from 'react'
import Button from '../components/button'
import '../css/callPreview.scss'
import { useLocation, useNavigate } from 'react-router-dom';
import CallMap from '../components/CallMap';

function CallPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pickup, dropoff } = location.state || {};

  // pickup과 dropoff가 없는 경우 처리
  if (!pickup || !dropoff) {
    return <div>경로 데이터를 불러오는 중입니다...</div>;
  }
  
  const handleNavigateToCalling = () => {
    navigate('/calling', {
      state: {
        pickup: pickup,  // pickup 좌표
        dropoff: dropoff // dropoff 좌표
      }
    });
  };

  const height = 500;
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
        showTaxi={false}
      /> {/* 경로가 있으면 지도 표시 */}
      <div className='callPreviewBtnWrap'>
        <div className='price'>예상금액 17,200원</div>
        <Button btnData={btnData} />
      </div>
    </div>
  )
}

export default CallPreview;
