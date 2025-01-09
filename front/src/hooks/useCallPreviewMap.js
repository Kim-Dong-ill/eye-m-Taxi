import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
// import 'mapbox-gl/dist/mapbox-gl.css';
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const useCallPreviewMap = (mapContainerRef, style, config,) => {
    const mapRef = useRef(null);    
    
    useEffect(() => {
        if (!mapContainerRef.current) return; // 컨테이너 존재 여부 확인

        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: style,
            center: config.initialCenter,
            zoom: config.initialZoom,
        });

         // 맵 로드 완료 후 현재 위치 가져오기
         mapRef.current.on('load', () => {
            //두 좌표 네비게이션 기능 작성

            

            const language = new MapboxLanguage({
                defaultLanguage: config.defaultLanguage,
            });
            mapRef.current.addControl(language);
        });

         

        // 클린업 함수 추가
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
        
    },[mapContainerRef, style, config]);

  

}

export default useCallPreviewMap
