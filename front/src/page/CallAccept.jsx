import React from "react";
import Button from "../components/button";
import Map from "../components/Map";
import sound from "../../public/icon/Sound.svg";
import call from "../../public/icon/Call.svg";

import "../css/callAccept.scss";

function CallAccept() {
  const height = 450;

  const btnData = [
    {
      text: "68저 9856",
      link: "",
      disabled: true,
    },
    {
      text: "3분 뒤 도착 예정",
      link: "",
      disabled: true,
    },
  ];

  return (
    <div className="callAccept">
      <Map height={height} />
      <div className="buttons">
        {btnData.map((btn, index) => (
          <Button key={index} btnData={btn} />
        ))}
      </div>
      <div className="icons">
        <button className="icon-button">
          <img src={sound} alt="speaker" />
        </button>
        <button className="icon-button">
          <img src={call} alt="phone" />
        </button>
      </div>
    </div>
  );
}

export default CallAccept;
