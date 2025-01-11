import React, { useRef, useEffect } from 'react';
import { mapConfig } from '../config/mapConfig';
import useCallPreviewMap from '../hooks/useCallMap';

function CallMap({ height, pickup, dropoff }) {
    const mapContainerRef = useRef(null);

    const mapRef = useCallPreviewMap(mapContainerRef, mapConfig.defaultStyle, mapConfig, pickup, dropoff);
    
    return (
      
        <div className="map-wrapper" style={{ width: '100%', height: `${height}px` }}>
          
            <div ref={mapContainerRef} className="mapContainer" style={{ width: '100%', height: '100%' }} />
        </div>
    );
}

export default CallMap;
