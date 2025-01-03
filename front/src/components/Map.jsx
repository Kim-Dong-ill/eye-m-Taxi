import React, { useRef } from 'react'
import useMap from '../hooks/useMap'
import { mapConfig } from '../config/mapConfig'
import '../css/map.css'

function Map({height, currentPosition}) {

    const mapContainerRef = useRef(null);
    const currentMapCenter = useMap(mapContainerRef, mapConfig.defaultStyle, mapConfig, currentPosition);
    
    console.log('현재 지도 중심 좌표:', currentMapCenter);

  return (
    <div className="map-wrapper" style={{ position: 'relative', width: '100%', height: `${height}px` }}>
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
