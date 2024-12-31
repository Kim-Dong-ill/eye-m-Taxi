import React from "react";
import Header from "../components/layout/Header";
import InputBox from "../components/InputBox";
import "../css/login.scss";
import user from "../../public/icon/Person.svg";
import lock from "../../public/icon/Lock.svg";
import Button from "../components/button";
import kakaoLogin from "../../public/icon/kakaoLogin.svg";

function Login() {
  const data = [
    {
      img: user,
      type: "text",
      placeholder: "아이디",
    },
    {
      img: lock,
      type: "password",
      placeholder: "비밀번호",
    },
  ];

  const btnData = {
    text : "회원가입",
    link : "/register"
  }
  return (
    <div className="login">
      <div className="loginContainer">
        <Header />
        <div>
          <InputBox data={data} />
        </div>
        <div className="loginButton">
          <img src={kakaoLogin} alt="" />
          <Button btnData={btnData}/>
        </div>
      </div>
    </div>
  );
}

export default Login;
