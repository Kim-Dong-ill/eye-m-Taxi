import React, { useEffect } from 'react'
import Map from '../components/Map'
import Button from '../components/button'
import { useNavigate } from 'react-router-dom';

function Driveing() {

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/driveFinish');
    }, 10000); // 10초 후 이동

    // 컴포넌트가 언마운트될 때 타이머 정리
    return () => clearTimeout(timer);
  }, [navigate]);

  const height = 600;
  const btnData ={
    text : "도착까지 1분",
    link : ""
  }

  return (
    <div className='callPreview'>
      <Map height={height}/>
      <Button btnData={btnData}/>
    </div>
  )
}

export default Driveing
