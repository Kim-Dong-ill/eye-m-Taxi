import React, { useRef } from 'react'
import useMap from '../hooks/useMap'
import { mapConfig } from '../config/mapConfig'

function Map({height}) {

    const mapContainerRef = useRef(null);

    useMap(mapContainerRef, mapConfig.defaultStyle, mapConfig);
  return (
    <div ref={mapContainerRef} className='mapContainer' style={{width: '100%', height: `${height}px`}}/>
  )
}

export default Map
