import React, { useEffect, useState } from 'react'
import '../css/voiceRecordList.scss'
import SearchBar from '../components/SearchBar'
import { useNavigate, useParams } from 'react-router-dom';

function VoiceRecordList() {
  const [selectedAddress, setSelectedAddress] = useState('');//키패드로 온 검색어
  const [text, setText] = useState('')//음성으로 온 검색어
  const [searchResults, setSearchResults] = useState([]);
  const {word} = useParams()

  useEffect(() => {
    setText(word);
    if (word) {
      searchKakaoPlaces(word);
    }
  }, [word]);
  
  const handleSearch = (text) => {
    setSelectedAddress(text);
    searchKakaoPlaces(text);
  };
  

  const searchKakaoPlaces = async (query) => {
    try {
      const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': 'KakaoAK 690abb055333319730303c2edd8ff5f9',
          'Content-Type': 'application/json;charset=UTF-8',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // 검색 결과를 원하는 형식으로 변환
      const formattedResults = data.documents.map(place => ({
        text: place.place_name
      }));
      
      setSearchResults(formattedResults);
    } catch (error) {
      console.error('카카오 장소 검색 에러:', error);
      setSearchResults([]);
    }
  };


  return (
    <div className='voiceRecordList'>
      <SearchBar onSearch={handleSearch} text={text}/>
      <div className='voiceRecordListContainer'>
        {searchResults?.map((item,idx)=>{
          return (<div key={idx} className='voiceRecordListText'>{item.text}</div>)
        })}
      </div>
    </div>
  )
}

export default VoiceRecordList
