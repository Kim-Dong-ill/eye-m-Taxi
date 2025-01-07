import React, { useEffect, useRef, useState } from 'react'
import useMap from '../hooks/useMap'
import { mapConfig } from '../config/mapConfig'
import '../css/map.css'

function Map({height, handleCurrentPosition}) {
  const [mapHeight, setMapHeight] = useState(height);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    const mapContainerRef = useRef(null);
    const currentMapCenter = useMap(mapContainerRef, mapConfig.defaultStyle, mapConfig, handleCurrentPosition);
    
    useEffect(() => {
      // 키보드 표시 여부 감지
      const handleFocus = () => setIsKeyboardVisible(true);
      const handleBlur = () => setIsKeyboardVisible(false);
      
      // 모든 input 요소에 대해 이벤트 리스너 추가
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
          input.addEventListener('focus', handleFocus);
          input.addEventListener('blur', handleBlur);
      });

      return () => {
          inputs.forEach(input => {
              input.removeEventListener('focus', handleFocus);
              input.removeEventListener('blur', handleBlur);
          });
      };
  }, []);

  // 키보드가 보일 때는 지도를 숨김
  if (isKeyboardVisible) {
      return null;
  }

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
