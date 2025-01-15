import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import axios from 'axios';
// import 'mapbox-gl/dist/mapbox-gl.css';
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const useCallPreviewMap = (mapContainerRef, style, config, pickup, dropoff) => {
    const mapRef = useRef(null);
    const [route, setRoute] = useState(null);

    // 카카오 내비 API로 경로를 요청하는 함수
    const getRoute = async () => {
        console.log("카카오API 호출")
        if (!pickup?.coordinates || !dropoff?.coordinates) {
            console.error("pickup or dropoff coordinates are missing");
            return;
        }

        try {
            const response = await axios.post(
                'https://apis-navi.kakaomobility.com/v1/waypoints/directions',
                {
                    origin: {
                        x: pickup.coordinates.lng, // 출발지 경도
                        y: pickup.coordinates.lat, // 출발지 위도
                    },
                    destination: {
                        x: dropoff.coordinates.lng, // 도착지 경도
                        y: dropoff.coordinates.lat, // 도착지 위도
                    },
                    priority: 'RECOMMEND', // 추천 경로 우선순위
                },
                {
                    headers: {
                        Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_CLIENT_ID}`, // API 키 전달
                    },
                }
            );

            // GeoJSON 형식으로 변환
            const routeGeoJSON = {
                type: 'FeatureCollection',
                features: response.data.routes.map((route) => {
                    console.log("Route Sections:", route.sections);
                    return {
                        type: 'Feature',
                        geometry: {
                            type: 'MultiLineString',
                            coordinates: route.sections.flatMap((section) => {
                                console.log("Section Roads:", section.roads);
                                return section.roads.map((item) => {
                                    return item.vertexes.map((value, index) => {
                                        if (index % 2 == 0) {
                                            return [value, item.vertexes[index + 1]]
                                        }
                                    }).filter((item) => item !== undefined)
                                })
                                // return section.roads.map((road) => [road.x, road.y]);
                            }),
                        },
                    };
                }),
            };
            console.log("Generated GeoJSON:", routeGeoJSON);


            // 경로 정보 저장
            setRoute(routeGeoJSON);
        } catch (error) {
            console.error("Error fetching route:", error);
        }
    };

    useEffect(() => {
        if (!mapContainerRef.current) return; // 컨테이너 존재 여부 확인

        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: style,
            center: [pickup.coordinates.lng, pickup.coordinates.lat],
            // [pickup.coordinates.lng, pickup.coordinates.lat],
            zoom: config.initialZoom,
        });

        // 맵 로드 완료 후 현재 위치 가져오기
        mapRef.current.on('load', () => {
            if (pickup && dropoff) {
                // 카카오 내비 API에서 경로를 받아옴
                getRoute();
            }

            const language = new MapboxLanguage({
                defaultLanguage: config.defaultLanguage,
            });
            mapRef.current.addControl(language);

            // console.log(pickup.coordinates.lng, pickup.coordinates.lat);
            
            const pickupMarker = new mapboxgl.Marker({ color:"blue" })
                .setLngLat([pickup.coordinates.lng, pickup.coordinates.lat])
                .setPopup(new mapboxgl.Popup().setText("출발"))
                .addTo(mapRef.current);

            new mapboxgl.Marker({ color: 'red' })
                .setLngLat([dropoff.coordinates.lng, dropoff.coordinates.lat])
                .setPopup(new mapboxgl.Popup().setText("도착"))
                .addTo(mapRef.current);
            
        });
        // 클린업 함수 추가
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };

    }, [mapContainerRef, style, config, pickup, dropoff]);

    // 경로 데이터를 지도에 표시
    useEffect(() => {
        if (route && mapRef.current) {
            console.log("Adding route to the map:", route);

            // 기존 경로를 제거 후 새로 추가
            if (mapRef.current.getSource('route')) {
                mapRef.current.getSource('route').setData(route);
            } else {
                mapRef.current.addSource('route', {
                    type: 'geojson',
                    data: route,
                });
                mapRef.current.addLayer({
                    id: 'route',
                    type: 'line',
                    source: 'route',
                    paint: {
                        'line-color': '#FFFFFF',
                        'line-width': 10,
                    },
                });

              // console.log(`route : ${route.features.geometry.cooridnates}`)
            }
        }
    }, [route]); // 의존성 배열에 route 추가
    
    return mapRef.current;
};

export default useCallPreviewMap;
