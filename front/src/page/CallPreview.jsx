import React from 'react'
import Button from '../components/button'
import '../css/callPreview.scss'
import { useLocation } from 'react-router-dom';
import CallPreviewMap from '../components/CallPreviewMap';

function CallPreview() {
  const location = useLocation();
  const { pickup, dropoff } = location.state || {};
  console.log("승차 좌표",pickup.coordinates);//승차 좌표 
  console.log("하차 좌표",dropoff.coordinates);//하차 좌표
  
  const height = 600;
  const btnData ={
    text : "호출하기",
    link : "/calling" 
  }
  return (
    <div className='callPreview'>
      <CallPreviewMap height={height} />
      <Button btnData={btnData}/>
    </div>
  )
}

export default CallPreview
