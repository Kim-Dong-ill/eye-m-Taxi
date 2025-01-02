import React, { useState } from "react";
import Button from "../components/button";
import "../css/starScope.scss";
import bigStar from "../../public/icon/bigStar.svg";

function StarScope() {
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
          <img key={index} src={bigStar} alt="" />
        ))}
      </div>
      <div className="bigStar"onClick={handleStarClick}>
        <img src={bigStar} alt="" />
      </div>
      <Button btnData={btnData} />
    </div>
  );
}

export default StarScope;
