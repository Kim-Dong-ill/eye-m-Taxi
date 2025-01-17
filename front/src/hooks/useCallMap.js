import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import axios from 'axios';
// import 'mapbox-gl/dist/mapbox-gl.css';
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const useCallPreviewMap = (mapContainerRef, style, config, pickup, dropoff, showTaxi) => {
  const mapRef = useRef(null);
  const [route, setRoute] = useState(null);
  const [taxiRoute, setTaxiRoute] = useState(null);
  const [taxiMarker, setTaxiMarker] = useState(null); // 택시 마커 상태

  // 중간 지점 계산 함수
  const calculateMidPoint = (pickup, dropoff) => {
    if (!pickup || !dropoff) return null;

    const midLng = (pickup.coordinates.lng + dropoff.coordinates.lng) / 2;
    const midLat = (pickup.coordinates.lat + dropoff.coordinates.lat) / 2;

    return { lng: midLng, lat: midLat };
  };

  // 카카오 내비 API로 경로를 요청하는 함수
  const getRoute = async (origin, destination) => {
    console.log("카카오API 호출");
    if (!origin?.coordinates || !destination?.coordinates) {
      console.error("origin or destination coordinates are missing");
      return;
    }

    try {
      const response = await axios.post(
        'https://apis-navi.kakaomobility.com/v1/waypoints/directions',
        {
          origin: {
            x: origin.coordinates.lng, // 출발지 경도
            y: origin.coordinates.lat, // 출발지 위도
          },
          destination: {
            x: destination.coordinates.lng, // 도착지 경도
            y: destination.coordinates.lat, // 도착지 위도
          },
          priority: 'RECOMMEND', // 추천 경로 우선순위
        },
        {
          headers: {
            Authorization: `KakaoAK ${process.env.VITE_KAKAO_CLIENT_ID}`, // API 키 전달
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
                    if (index % 2 === 0) {
                      return [value, item.vertexes[index + 1]];
                    }
                  }).filter((item) => item !== undefined);
                });
              }),
            },
          };
        }),
      };
      return routeGeoJSON;
    } catch (error) {
      console.error("Error fetching route:", error);
      return null;
    }
  };

  // 택시 경로 요청 함수
  const getTaxiRoute = async () => {
    if (pickup && showTaxi) {
      const midPoint = calculateMidPoint(pickup, dropoff);
      console.log("midpoint:", midPoint);
      if (midPoint) {
        console.log("midpoint:", midPoint);
        const routeGeoJSON = await getRoute({ coordinates: midPoint }, pickup);
        setTaxiRoute(routeGeoJSON);
      }
    }
  };

  // 카카오 내비 API로 경로를 요청하는 함수
  const getDropoffRoute = async () => {
    if (pickup && dropoff) {
      const routeGeoJSON = await getRoute(pickup, dropoff);
      setRoute(routeGeoJSON);

      if (showTaxi) {
        getTaxiRoute();
      }
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return; // 컨테이너 존재 여부 확인

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: style,
      center: [pickup.coordinates.lng, pickup.coordinates.lat],
      zoom: config.initialZoom,
    });

    // 맵 로드 완료 후 현재 위치 가져오기
    mapRef.current.on('load', () => {
      if (pickup && dropoff) {
        // 카카오 내비 API에서 경로를 받아옴
        getDropoffRoute();
      }

      const language = new MapboxLanguage({
        defaultLanguage: config.defaultLanguage,
      });
      mapRef.current.addControl(language);

      // 출발지 마커 추가
      const pickupMarker = new mapboxgl.Marker({ color: "blue" })
        .setLngLat([pickup.coordinates.lng, pickup.coordinates.lat])
        .setPopup(new mapboxgl.Popup().setText("출발"))
        .addTo(mapRef.current);

      // 도착지 마커 추가
      new mapboxgl.Marker({ color: 'red' })
        .setLngLat([dropoff.coordinates.lng, dropoff.coordinates.lat])
        .setPopup(new mapboxgl.Popup().setText("도착"))
        .addTo(mapRef.current);

      // 택시 마커 추가
      if (showTaxi) {
        const midPoint = calculateMidPoint(pickup, dropoff);
        if (midPoint) {
          // 기존 마커가 있으면 마커를 업데이트
          if (taxiMarker) {
            taxiMarker.setLngLat([midPoint.lng, midPoint.lat]);
          } else {
            // 마커가 없으면 새로 생성
            const taxi = new mapboxgl.Marker({ color: 'green' }) // 택시 마커 색상
              .setLngLat([midPoint.lng, midPoint.lat])
              .setPopup(new mapboxgl.Popup().setText("택시 위치"))
              .addTo(mapRef.current);

            setTaxiMarker(taxi); // 상태에 마커 저장
          }

          // 택시 경로 요청
          getTaxiRoute();
        }
      }
    });

    // 클린업 함수 추가
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapContainerRef, style, config, pickup, dropoff, showTaxi]);

  // 경로 데이터를 지도에 표시
  useEffect(() => {
    if (route && mapRef.current) {
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
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#ffffff', // 경로 색상
            'line-width': 7,
          },
        });
      }
    }

    if (taxiRoute && mapRef.current) {
      if (mapRef.current.getSource('taxiRoute')) {
        mapRef.current.getSource('taxiRoute').setData(taxiRoute);
      } else {
        mapRef.current.addSource('taxiRoute', {
          type: 'geojson',
          data: taxiRoute,
        });
        mapRef.current.addLayer({
          id: 'taxiRoute',
          type: 'line',
          source: 'taxiRoute',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': 'green', // 택시 경로 색상
            'line-width': 10,
          },
        });
      }

      // 택시 경로의 좌표 배열 추출 (flatten 처리)
      const taxiCoordinates = taxiRoute.features[0]?.geometry.coordinates.flat();
      if (taxiCoordinates && taxiCoordinates.length > 0) {
        // 택시 마커가 경로를 따라 움직이는 애니메이션 추가
        animateTaxiMarker(taxiCoordinates);
      }
    }
  }, [taxiRoute, route]);

  // 택시 마커 애니메이션 함수
  const animateTaxiMarker = (coordinates) => {
    if (!coordinates || coordinates.length === 0 || !mapRef.current || !taxiMarker) return; // 택시 마커가 없거나 경로가 없으면 종료

    let currentIndex = 0;

    const moveTaxi = () => {
      if (currentIndex < coordinates.length) {
        taxiMarker.setLngLat(coordinates[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(moveInterval); // 경로가 끝나면 애니메이션 멈춤
      }
    };

    const moveInterval = setInterval(moveTaxi, 300); // 100ms마다 한 칸씩 이동
  };

  return mapRef.current;
};

export default useCallPreviewMap;
