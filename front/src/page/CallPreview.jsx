import React from 'react'
import Map from '../components/Map'
import Button from '../components/button'
import '../css/callPreview.scss'
import { useLocation } from 'react-router-dom';

function CallPreview() {
  const location = useLocation();
  const { pickup, dropoff } = location.state || {};
  console.log(pickup.coordinates);//승차 좌표 
  console.log(dropoff.coordinates);//하차 좌표
  

  const height = 600;
  const btnData ={
    text : "호출하기",
    link : "/calling" 
  }
  return (
    <div className='callPreview'>
      <Map height={height}/>
      <Button btnData={btnData}/>
    </div>
  )
}

export default CallPreview
