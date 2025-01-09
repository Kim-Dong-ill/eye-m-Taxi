import React, { useRef } from 'react'
import { mapConfig } from '../config/mapConfig'
import useCallPreviewMap from '../hooks/useCallPreviewMap';


function CallPreviewMap({height}) {

    const mapContainerRef = useRef(null);
    const currentMapCenter = useCallPreviewMap(mapContainerRef, mapConfig.defaultStyle, mapConfig,);

  return (
    <div className="map-wrapper" style={{ width: '100%', height: `${height}px` }}>
            <div ref={mapContainerRef} className='mapContainer' style={{width: '100%', height: '100%'}}/>
        </div>
  )
}

export default CallPreviewMap
