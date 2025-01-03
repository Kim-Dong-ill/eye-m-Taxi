import React from "react";
import "../css/mainPage.scss";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosInstance from "../utils/axios";

function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="mainPage">
      <div className="mainPageItemContainer">
        <div className="mainPageItem" onClick={() => navigate("/getOnGetOff")}>
          승차
        </div>
        <div className="mainPageItem" onClick={() => navigate("/getOnGetOff")}>
          하차
        </div>
        <div>
          <div>승차 : </div>
          <div>하차 : </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
