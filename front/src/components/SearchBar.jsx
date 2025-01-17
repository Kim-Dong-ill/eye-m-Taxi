import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/components/searchBar.scss';
import SvgThema from './SvgThema';
import { useTheme } from '../components/contain/ThemeContext'

function SearchBar({ onSearch, text = '', locationType, locationState }) {  
  const [searchAddress, setSearchAddress] = useState(text);  // text prop으로 초기값 설정
  const navigate = useNavigate();
  const location = useLocation();
  const { themeColor } = useTheme()

  const handleFocus = () => {
    setSearchAddress('');  // input 클릭(포커스) 시 값 초기화
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchAddress.trim()) {
      onSearch(searchAddress);
    }
  };

  const handleMicClick = (e) => {
    e.preventDefault(); // form submit 방지
    navigate(`/voiceRecord?type=${locationType}`, {
      state: locationState  // locationState를 전달
    });
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          onFocus={handleFocus}
          placeholder="주소를 입력하세요"
          className="address-input"
        />
        <button type="button" className="mic-button" onClick={handleMicClick} aria-label='주소 음성 검색'>
          <SvgThema icon="MIC_SVG" color={themeColor} />
        </button>
      </form>
    </div>
  );
}

export default SearchBar;