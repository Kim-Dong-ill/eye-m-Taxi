import React, { useState } from "react";
import Button from "../components/button";
import "../css/starScope.scss";
import SvgThema from "../components/SvgThema";
import { useTheme } from '../components/contain/ThemeContext'

function StarScope() {
  const { themeColor } = useTheme()
  const [starCount, setStarCount] = useState(1);  // 별 개수 상태 추가
  const btnData = {
    text: "별점 남기기",
    link: "/",
  };
  const handleStarClick = () => {
    setStarCount(prev => prev >= 5 ? 1 : prev + 1);
  };

  return (
    <div className="starScope">
      <div className="smallStar">
        {[...Array(starCount)].map((_, index) => (
          <SvgThema key={index} icon="BIG_STAR_SVG" color={themeColor} size="100px"/>
        ))}
      </div>
      <div className="bigStar"onClick={handleStarClick}>
        <SvgThema icon="BIG_STAR_SVG" color={themeColor}/>
      </div>
      <Button btnData={btnData} />
    </div>
  );
}

export default StarScope;
