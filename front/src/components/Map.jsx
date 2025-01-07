import React, { useEffect, useRef, useState } from 'react'
import useMap from '../hooks/useMap'
import { mapConfig } from '../config/mapConfig'
import '../css/map.css'

function Map({height, handleCurrentPosition}) {
  const [mapHeight, setMapHeight] = useState(height);
    const mapContainerRef = useRef(null);
    const currentMapCenter = useMap(mapContainerRef, mapConfig.defaultStyle, mapConfig, handleCurrentPosition);
    
    useEffect(() => {
      // 뷰포트 높이 변화 감지
      const handleResize = () => {
          const viewportHeight = window.visualViewport.height;
          setMapHeight(Math.min(600, viewportHeight * 0.6)); // 뷰포트 높이의 60% 또는 최대 600px
      };

      // visualViewport API 사용
      window.visualViewport.addEventListener('resize', handleResize);
      handleResize(); // 초기 높이 설정

      return () => {
          window.visualViewport.removeEventListener('resize', handleResize);
      };
  }, []);

  return (
    <div className="map-wrapper" style={{ position: 'relative', width: '100%',height: mapHeight}}>
            <div ref={mapContainerRef} className='mapContainer' style={{width: '100%', height: '100%'}}/>
            <img 
                src="/icon/marker2.svg"  
                alt="marker"
                className="center-marker"
            />
        </div>
        )
}

export default Map
