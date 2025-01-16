import React from "react";
import "../css/components/inputBox.scss";
import SvgThema from "./SvgThema";
import { useTheme } from './contain/ThemeContext'

function inputBox({ data }) {
  const { themeColor } = useTheme()
  
  return data.map((item, index) => (
    <div key={index} className="inputBox">
      <div className="inputBoxIcon">
        <SvgThema icon={item.icon} color={themeColor} />
      </div>
      <input
        className="inputBoxInput"
        type={item.type}
        name={item.name}
        placeholder={item.placeholder}
        maxLength={item.maxLength}
        onInput={item.onInput}
        onChange={item.onChange}
        value={item.value || ""}
      />
    </div>
  ));
}

export default inputBox;
