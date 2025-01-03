import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/components/searchBar.scss';
import mic from "../../public/icon/Microphone.svg";

function SearchBar({ onSearch, text }) {
  const [searchAddress, setSearchAddress] = useState(text || '');  // text prop으로 초기값 설정
  const navigate = useNavigate();

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
    navigate('/voiceRecord'); // VoiceRecord 페이지로 이동
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
        <button type="button" className="mic-button" onClick={handleMicClick}>
          <img src={mic} alt="microphone" />
        </button>
      </form>
    </div>
  );
}

export default SearchBar;