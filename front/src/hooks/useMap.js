import React, { useEffect } from 'react'
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
// import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;


const useMap = (mapContainerRef, style, config) => {
    
    useEffect(() => {
      
        if (!mapContainerRef.current) return; // 컨테이너 존재 여부 확인


        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: style,
            center: config.initialCenter,
            zoom: config.initialZoom,
        });

         // 맵 로드 완료 후 컨트롤 추가
         map.on('load', () => {
            const language = new MapboxLanguage({
                defaultLanguage: config.defaultLanguage,
            });
            map.addControl(language);
        });

        // 클린업 함수 추가
        return () => {
            map.remove();
        };
    },[mapContainerRef, style, config])
}

export default useMap
