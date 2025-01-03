import React, {useState, useEffect} from 'react'
import Map from '../components/Map'
import Button from '../components/button'
import SearchBar from '../components/SearchBar'
import '../css/getOnGetOff.scss'

function GetOnGetOff() {

  const [selectedAddress, setSelectedAddress] = useState('');
  const [currentPosition, setCurrentPosition] = useState(null);
  const height = 600;
  const btnData = {
    text: "이 위치로 설정",
    link: "/"
  }

  const handleSearch = (address) => {
    setSelectedAddress(address);
    console.log('검색한 주소:', address);
  };

  // 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting current position:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  return (
    <div className="get-on-get-off">
      <SearchBar onSearch={handleSearch} />
        <Map height={height} currentPosition={currentPosition}/>
      <div className="button-container">
        <Button btnData={btnData}/>
      </div>
    </div>
  )
}
export default GetOnGetOff
