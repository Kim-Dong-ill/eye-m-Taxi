import React, { useState } from 'react'
import '../css/voiceRecordList.scss'
import SearchBar from '../components/SearchBar'

function VoiceRecordList() {
  const [selectedAddress, setSelectedAddress] = useState('');

  const result = [
    {text: '가산디지털단지역 7호선'},
    {text: '가산디지털단지역환승 노상공영주차장'},
    {text: '가산디지털단지역환승 사거리'},
    {text: '가산디지털단지역환승 사거리'},
    {text: '올리브영 가산 디지털단지역'},
    {text: '리안헤어 가산디지털단지역'},
    {text: '리안헤어 가산디지털단지역'},
    {text: '리안헤어 가산디지털단지역'},
    {text: '리안헤어 가산디지털단지역'},
  ]

  const handleSearch = (address) => {
    setSelectedAddress(address);
    console.log('검색한 주소:', address);
  };

  return (
    <div className='voiceRecordList'>
      <SearchBar onSearch={handleSearch}/>
      <div className='voiceRecordListContainer'>
        {result.map((item,idx)=>{
          return (<div key={idx} className='voiceRecordListText'>{item.text}</div>)
        })}
      </div>
    </div>
  )
}

export default VoiceRecordList
