import React, { useState } from "react";
import Header from "../components/layout/Header";
import InputBox from "../components/InputBox";
import "../css/login.scss";
import user from "../../public/icon/Person.svg";
import lock from "../../public/icon/Lock.svg";
import Button from "../components/button";
import kakaoLogin from "../../public/icon/kakaoLogin.svg";
import { useDispatch } from "react-redux";
import { loginUser } from "../store/thunkFunctions";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = (e) => {
    e.preventDefault();

     // 입력값 검증
     if (!loginData.email || !loginData.password) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    console.log("로그인 시도:", loginData); // 전송되는 데이터 확인

    dispatch(
      loginUser({
        body: loginData,
        handleLoginError: (error) => {
          // 에러 메시지를 더 사용자 친화적으로 표시
          const userMessage = error.includes("사용자를 찾을 수 없습니다") 
            ? "아이디 또는 비밀번호가 올바르지 않습니다." 
            : error;
          alert(userMessage);
        },
      })
    );

    // navigate("/");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const data = [
    {
       img: user,
      type: "text",
      placeholder: "아이디",
      name: "email",
      value: loginData.email,
      onChange: handleChange
    },
    {
      img: lock,
      type: "password",
      placeholder: "비밀번호",
      name: "password",
      value: loginData.password,
      onChange: handleChange
    },
  ];

  const btnData = {
    text: "회원가입",
    link: "/register",
  };

 
  return (
    <div className="login">
      <div className="loginContainer">
        <Header />
        <form onSubmit={handleLogin}>
          <div>
            <InputBox data={data} handleChange={handleChange} />
          </div>
          <button type="submit">로그인</button>
          <div className="loginButton">
            <img src={kakaoLogin} alt="" />
            <Button btnData={btnData} />
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
