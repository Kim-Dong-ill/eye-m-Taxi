import React, { useEffect, useState } from "react";
import TextBox from "../components/TextBox";
import Button from "../components/button";
import "../css/calling.scss";
import { useNavigate } from "react-router-dom";

function Calling() {
  const navigate = useNavigate();
  const [distance, setDistance] = useState("1");

  useEffect(() => {
    const timer2s = setTimeout(() => {
      setDistance("2");
    }, 2500);

    const timer5s = setTimeout(() => {
      setDistance("5");
    }, 7000);

    const timerNavigate = setTimeout(() => {
      navigate(`/callAccept/`);
    }, 10000);

    // cleanup function
    return () => {
      clearTimeout(timer2s);
      clearTimeout(timer5s);
      clearTimeout(timerNavigate);
    };
  }, [navigate]);

  const text = [`최대 ${distance}분 거리에서`, `택시 호출중...`];
  const btnData = {
    text: "호출 취소하기",
    link: "/",
  };

  return (
    <div className="calling">
      <TextBox
        text={text.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < text.length - 1 && <br />}
          </React.Fragment>
        ))}
      />
      <Button btnData={btnData} />
    </div>
  );
}

export default Calling;
