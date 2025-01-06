import React, { useState, useEffect } from "react";
import Map from "../components/Map";
import Button from "../components/button";
import SearchBar from "../components/SearchBar";
import "../css/getOnGetOff.scss";
import { useLocation, useNavigate } from "react-router-dom";

const { kakao } = window;

function GetOnGetOff() {
  const [selectedAddress, setSelectedAddress] = useState("");
  const [currentPosition, setCurrentPosition] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const locationType = new URLSearchParams(location.search).get("locationType");
  console.log("currentPosition:", currentPosition?currentPosition:null);

  const height = 600;
  const btnData = {
    text: "이 위치로 설정",
    // link: "/",
  };

  // 좌표를 주소로 변환하는 함수
  const convertCoordToAddress = (lat, lng) => {
    const geocoder = new kakao.maps.services.Geocoder();
    const coord = new kakao.maps.LatLng(lat, lng);

    return new Promise((resolve, reject) => {
      geocoder.coord2Address(
        coord.getLng(),
        coord.getLat(),
        (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            const address = result[0];
            resolve({
              address: address.address.address_name,
              roadAddress: address.road_address?.address_name,
            });
            console.log(address);
          } else {
            reject(new Error("주소 변환 실패"));
          }
        }
      );
    });
  };

  //검색어 입력시 검색어를 파라미터로 전달하며 이동
  const handleSearch = (address) => {
    setSelectedAddress(address);
    navigate(
      `/voiceRecordList/${encodeURIComponent(address)}?type=${locationType}`,
      {
        state: location.state, // 현재의 state(승하차 정보)를 그대로 전달
      }
    );
  };

  // 이 위치로 설정 클릭시 선택된 위치를 MainPage로 전달하며 이동
  const handleSetLocation = async () => {
    try {
      if (currentPosition) {
        const addressInfo = await convertCoordToAddress(
          currentPosition.lat,
          currentPosition.lng
        );
        // 새로운 위치 정보 객체 생성
        const newLocationInfo = {
          address: addressInfo.roadAddress || addressInfo.address,
          coordinates: {
            lat: currentPosition.lat,
            lng: currentPosition.lng,
          },
        };

        // 기존 state와 새로운 위치 정보를 합쳐서 전달
        const newState = {
          ...location.state, // 기존 위치 정보 유지
          [locationType]: newLocationInfo, // 새로운 위치 정보 추가
        };

        // MainPage로 이동하며 주소 정보와 좌표 전달
        navigate("/", {
          state: newState,
        });
        console.log("전달되는 state:", newState); // state 확인용 로그
      }
    } catch (error) {
      console.error("주소 변환 중 오류 발생:", error);
      // 에러 처리 (예: 사용자에게 알림)
    }
  };

  

    // 현재 위치 업데이트 핸들러
    const handleCurrentPosition = (position) => {
      setCurrentPosition(position);
    };

  return (
    <div className="get-on-get-off">
      <SearchBar
        onSearch={handleSearch}
        locationType={locationType} // locationType을 props로 전달
        locationState={location.state}  // location.state를 SearchBar에 전달
      />

      <Map height={height} handleCurrentPosition={handleCurrentPosition}/>

      <div className="button-container" onClick={handleSetLocation}>
        <Button btnData={btnData} />
      </div>
    </div>
  );
}
export default GetOnGetOff;
