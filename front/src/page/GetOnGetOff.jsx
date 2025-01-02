import React, {useState} from 'react'
import Map from '../components/Map'
import Button from '../components/button'
import SearchBar from '../components/SearchBar'
import '../css/getOnGetOff.scss'

function GetOnGetOff() {

  const [selectedAddress, setSelectedAddress] = useState('');
  const height = 600;
  const btnData = {
    text: "이 위치로 설정",
    link: "/"
  }

  const handleSearch = (address) => {
    setSelectedAddress(address);
    console.log('검색한 주소:', address);
  };

  return (
    <div className="get-on-get-off">
      <SearchBar onSearch={handleSearch} />
        <Map height={height}/>
      <div className="button-container">
        <Button btnData={btnData}/>
      </div>
    </div>
  )
}
export default GetOnGetOff
