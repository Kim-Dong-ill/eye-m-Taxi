import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
// import 'mapbox-gl/dist/mapbox-gl.css';
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const useMap = (mapContainerRef, style, config, currentPosition) => {
    const mapRef = useRef(null);
    const [mapCenter, setMapCenter] = useState(config.initialCenter);
    
    useEffect(() => {
      
        if (!mapContainerRef.current) return; // 컨테이너 존재 여부 확인

        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: style,
            center: config.initialCenter,
            zoom: config.initialZoom,
        });

        // 지도 이동 완료 시 중심 좌표 업데이트
        mapRef.current.on('moveend', () => {
            const center = mapRef.current.getCenter();
            const newCenter = { lng: center.lng, lat: center.lat };
            setMapCenter(newCenter);
        });


         // 맵 로드 완료 후 컨트롤 추가
         mapRef.current.on('load', () => {
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

    // 현재 위치가 변경될 때마다 마커 업데이트
    useEffect(() => {
        if (!mapRef.current || !currentPosition) return;

        mapRef.current.flyTo({
            center: [currentPosition.lng, currentPosition.lat],
            zoom: 15
        });

    }, [currentPosition]);

    // mapCenter 상태를 반환
    return mapCenter;
}

export default useMap
