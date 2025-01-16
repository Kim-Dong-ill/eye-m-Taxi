import React from "react";
import { useNavigate } from "react-router-dom";
import "../../css/header.scss";
import { useTheme } from './ThemeContext'
import SvgThema from '../../components/SvgThema'
import logo from "../../../public/icon/logo.svg";


function Header({ showBackArrow, showMainPage }) {
  const navigate = useNavigate();
  const { themeColor } = useTheme()

  const handleBack = () => {
    navigate(-1);
  };

  const moveToMain = () => {
    if (showMainPage == false) {
      navigate("/");
    }
  };

  

  return (
    <div className="header">
      <div className="headerContainer">
        <div className="headerLeft">
        {showBackArrow && <SvgThema icon="ARROW_SVG" color={themeColor} onClick={handleBack} />}
        </div>
        <div className="headerCenter">
          <img src={logo} color={themeColor} onClick={moveToMain} />
        </div>
        <div className="headerRight">
        <SvgThema color={themeColor} />
        </div>
      </div>
    </div>
  );
}

export default Header;
