import React from "react";
import { 
  ARROW_SVG, 
  LOGO_SVG, 
  MIC_SVG, 
  BIG_STAR_SVG, 
  CALL_SVG, 
  LOCK_SVG, 
  SOUND_SVG,
  PERSON_SVG
} from "./AllSvg";

const Icons = {
  ARROW_SVG,
  LOGO_SVG,
  MIC_SVG,
  BIG_STAR_SVG,
  CALL_SVG,
  LOCK_SVG,
  SOUND_SVG,
  PERSON_SVG
};

const iconSizes = {
  ARROW_SVG: { width: "54px", height: "54px" },
  LOGO_SVG: { width: "200px", height: "120px" },
  MIC_SVG: { width: "312px", height: "312px" },
  BIG_STAR_SVG: { width: "270px", height: "256px" },
  CALL_SVG: { width: "120px", height: "120px" },
  LOCK_SVG: { width: "36px", height: "36px" },
  SOUND_SVG: { width: "120px", height: "120px" },
  PERSON_SVG: { width: "36px", height: "36px" }
};

const SvgThema = ({ icon, color, onClick, size }) => {
  // 아이콘이 유효한지 확인
  if (!Icons[icon]) {
    console.warn(`Invalid icon: ${icon}`);
    return null;
  }

  return (
    <div
      className="svg-icon"
      onClick={onClick}
      style={{
        backgroundColor: color,
        width: size || iconSizes[icon].width,    // size prop이 있으면 사용, 없으면 기본값 사용
        height: size || iconSizes[icon].height,   // size prop이 있으면 사용, 없으면 기본값 사용
        WebkitMask: `url("${Icons[icon]}") center/contain no-repeat`,
        mask: `url("${Icons[icon]}") center/contain no-repeat`,
        cursor: onClick ? "pointer" : "default",
      }}
    />
  );
};

export default SvgThema;
