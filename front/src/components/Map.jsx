import React, { useEffect, useRef, useState } from 'react'
import useMap from '../hooks/useMap'
import { mapConfig } from '../config/mapConfig'
import '../css/map.css'
import marker2 from "../../public/icon/marker2.svg"

function Map({height, handleCurrentPosition}) {
    const mapContainerRef = useRef(null);
    useMap(mapContainerRef, mapConfig.defaultStyle, mapConfig, handleCurrentPosition);

    

  return (
    <div className="map-wrapper" style={{ position: 'relative', width: '100%',height: height}}>
            <div ref={mapContainerRef} className='mapContainer' style={{width: '100%', height: '100%'}}/>
            <img 
                src={marker2}
                alt="현 위치 마커"
                className="center-marker"
                aria-label="현 위치 마커"
            />
        </div>
        )
}

export default Map
