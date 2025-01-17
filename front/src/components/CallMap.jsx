import React, { useRef, useEffect } from 'react';
import { mapConfig } from '../config/mapConfig';
import useCallPreviewMap from '../hooks/useCallMap';
import mapboxgl from 'mapbox-gl';

function CallMap({ height, pickup, dropoff, showTaxi = false ,handleStartCamera}) {
    const mapContainerRef = useRef(null);

    const mapRef = useCallPreviewMap(mapContainerRef, mapConfig.defaultStyle, mapConfig, pickup, dropoff, showTaxi,handleStartCamera);

    return (
      
        <div className="map-wrapper" style={{ width: '100%', height: `${height}px` }}>
          
            <div ref={mapContainerRef} className="mapContainer" style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
}

export default CallMap;
