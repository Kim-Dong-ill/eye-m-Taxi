import React, { useEffect, useState } from "react";
import "../css/mainPage.scss";
import { useLocation, useNavigate } from "react-router-dom";

function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pickupLocation, setPickupLocation] = useState(''); // 승차 위치
  const [dropoffLocation, setDropoffLocation] = useState(''); // 하차 위치
console.log(pickupLocation);
console.log(dropoffLocation);


  // location.state로 전달된 주소 처리
  useEffect(() => {
    if (location.state) {
      // 승차 위치가 전달된 경우
      if (location.state.pickup) {
        setPickupLocation(location.state.pickup);
      }
      // 하차 위치가 전달된 경우
      if (location.state.dropoff) {
        setDropoffLocation(location.state.dropoff);
      }
    }
  }, [location.state]);

  // 승하차 버튼 클릭 시 현재 설정된 위치 정보를 함께 전달
  const handleLocationClick = (type) => {
    const currentLocations = {
      pickup: pickupLocation,
      dropoff: dropoffLocation
    };
    navigate(`/getOnGetOff?locationType=${type}`, {
      state: currentLocations
    });
    console.log(currentLocations);
    
  };

  // 두 위치가 모두 있을 때 다음 페이지로 이동
  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      navigate('/callPreview', {
        state: {
          pickup: pickupLocation,
          dropoff: dropoffLocation
        }
      });
    }
  }, [pickupLocation, dropoffLocation,navigate]);

  return (
    <div className="mainPage">
      <div className="mainPageItemContainer">
      <div className="mainPageItem" onClick={() => handleLocationClick('pickup')}>
      승차
        </div>
        <div className="mainPageItem" onClick={() => handleLocationClick('dropoff')}>
          하차
        </div>
        <div>
        {pickupLocation?.address && <div>승차 : {pickupLocation.address}</div>}
        {dropoffLocation?.address && <div>하차 : {dropoffLocation.address}</div>}
        </div>
      </div>
    </div>
  );
}

export default MainPage;
