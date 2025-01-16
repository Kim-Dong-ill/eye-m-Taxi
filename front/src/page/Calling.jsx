import React, { useEffect, useState } from "react";
import TextBox from "../components/TextBox";
import Button from "../components/button";
import "../css/calling.scss";
import { useNavigate, useLocation } from "react-router-dom";

function Calling() {
  const navigate = useNavigate();
  const location = useLocation();

  const { pickup, dropoff } = location.state || {};

  // 좌표값이 제대로 전달되었는지 콘솔에 출력
  useEffect(() => {
    console.log("Calling 페이지에서 전달받은 좌표값:");
    console.log("pickup:", pickup);
    console.log("dropoff:", dropoff);
  }, [pickup, dropoff]);


  const [distance, setDistance] = useState("1");

  useEffect(() => {
    const timer2s = setTimeout(() => {
      setDistance("2");
    }, 2500);

    const timer5s = setTimeout(() => {
      setDistance("5");
    }, 7000);

    const timerNavigate = setTimeout(() => {
      if (pickup && dropoff) {
      navigate("/callAccept/", {
        state: { pickup, dropoff },
      });
    }
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
