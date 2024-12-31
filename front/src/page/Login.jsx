import React from "react";
import Header from "../components/layout/Header";
import InputBox from "../components/InputBox";
import "../css/login.scss";
import user from "../../public/icon/Person.svg";
import lock from "../../public/icon/Lock.svg";

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
  
  return (
    <div className="login">
      <div className="loginContainer">
        <Header />
        <div>
          <InputBox data={data} />
        </div>
      </div>
    </div>
  );
}

export default Login;
