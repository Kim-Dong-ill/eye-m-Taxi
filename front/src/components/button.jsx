import React from "react";
import "../css/components/button.scss";
import { useNavigate } from "react-router-dom";

function Button({ btnData }) {
  const navigate = useNavigate();

  return (
    <div className="button" onClick={() => navigate(btnData.link)}>
      {btnData.text}
    </div>
  );
}

export default Button;
