import React, { useEffect, useState } from 'react'
import '../css/voiceRecordList.scss'
import SearchBar from '../components/SearchBar'
import { useNavigate, useParams } from 'react-router-dom';

function VoiceRecordList() {
  const [selectedAddress, setSelectedAddress] = useState('');
  const [text, setText] = useState('')
  const {word} = useParams()

  useEffect(()=>{

    setText(word)
  },[])
  
  const handleSearch = (text) => {
    setSelectedAddress(text);
    console.log('검색한 주소:', text);
  };
  

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


  return (
    <div className='voiceRecordList'>
      <SearchBar onSearch={handleSearch} text={text}/>
      <div className='voiceRecordListContainer'>
        {result.map((item,idx)=>{
          return (<div key={idx} className='voiceRecordListText'>{item.text}</div>)
        })}
      </div>
    </div>
  )
}

export default VoiceRecordList
