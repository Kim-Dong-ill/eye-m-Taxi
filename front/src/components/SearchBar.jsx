import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/components/searchBar.scss';
import mic from "../../public/icon/Microphone.svg";

function SearchBar({ onSearch }) {
  const [searchAddress, setSearchAddress] = useState('');
  const navigate = useNavigate();

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