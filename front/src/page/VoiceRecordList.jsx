import React, { useEffect, useState } from "react";
import "../css/voiceRecordList.scss";
import SearchBar from "../components/SearchBar";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const { kakao } = window;

function VoiceRecordList() {
  const [selectedAddress, setSelectedAddress] = useState(""); //키패드로 온 검색어
  const [text, setText] = useState(""); //음성으로 온 검색어
  const [searchResults, setSearchResults] = useState([]);
  const { word } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationType = new URLSearchParams(location.search).get("type");

  // 키워드 검색 함수
  const searchPlaces = (keyword) => {
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(keyword, (data, status) => {
      if (status === kakao.maps.services.Status.OK) {
        console.log("검색 결과:", data);
        const places = data.map((item) => ({
          text: item.place_name,
          coordinates: {
            lat: item.y,
            lng: item.x,
          },
        }));
        setSearchResults(places);
      } else {
        console.log("검색 결과가 없습니다.");
        setSearchResults([]);
      }
    });
  };

  // 초기 검색어로 검색
  useEffect(() => {
    setText(word);
    if (word) {
      searchPlaces(word);
    }
  }, [word]);

  // 검색바에서 검색
  const handleSearch = (searchText) => {
    setSelectedAddress(searchText);
    searchPlaces(searchText);
  };

  // 검색 결과 항목 클릭 시
  const handlePlaceSelect = (place) => {
    // 기존의 state 값을 가져옴
    const currentState = location.state || {};

    // 새로운 위치 정보와 기존 정보를 합침
    const newState = {
      ...currentState, // 기존 state 유지
      [locationType]: {
        address: place.text,
        coordinates: place.coordinates,
      },
    };

    // 승하차 위치가 모두 있으면 바로 callPreview로 이동
    if (newState.pickup && newState.dropoff) {
      navigate("/callPreview", {
        state: newState,
      });
    } else {
      // 둘 중 하나만 있으면 MainPage로 이동
      navigate("/", {
        state: newState,
      });
    }
  };

  return (
    <div className="voiceRecordList">
      <SearchBar onSearch={handleSearch} text={text} />
      <div className="voiceRecordListContainer">
        {searchResults.map((item, idx) => {
          return (
            <div
              key={idx}
              className="voiceRecordListText"
              onClick={() => handlePlaceSelect(item)}
            >
              {item.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VoiceRecordList;
