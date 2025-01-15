import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import 'mapbox-gl/dist/mapbox-gl.css';
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const useMap = (mapContainerRef, style, config, handleCurrentPosition) => {
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
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const currentPosition = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        // 현재 위치로 지도 이동
                        mapRef.current.flyTo({
                            center: [currentPosition.lng, currentPosition.lat],
                            zoom: 15
                        });
                        // 현재 위치 전달
                        handleCurrentPosition(currentPosition);
                    },
                    (error) => {
                        console.error("Error getting current position:", error);
                    }
                );
            }

            const language = new MapboxLanguage({
                defaultLanguage: config.defaultLanguage,
            });
            mapRef.current.addControl(language);
        });

         // 지도 이동 완료 시 새로운 중심 좌표 전달
         mapRef.current.on('moveend', () => {
            const center = mapRef.current.getCenter();
            handleCurrentPosition({
                lat: center.lat,
                lng: center.lng
            });
        });

        // 클린업 함수 추가
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
        
    },[mapContainerRef, style, config]);

    // 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
            handleCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting current position:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

    // 현재 위치가 변경될 때마다 마커 업데이트
    // useEffect(() => {
    //     if (!mapRef.current || !currentPosition) return;

    //     mapRef.current.flyTo({
    //         center: [currentPosition.lng, currentPosition.lat],
    //         zoom: 15
    //     });

    // }, [currentPosition]);

}

export default useMap
