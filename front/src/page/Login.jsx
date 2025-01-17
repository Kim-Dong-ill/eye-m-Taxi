
import React, { useState, useEffect } from "react";
import Header from "../components/contain/Header";
import InputBox from "../components/InputBox";
import "../css/login.scss";
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
  const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${import.meta.env.VITE_KAKAO_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_KAKAO_REDIRECT_URI}`;
useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    useEffect(() => {
    if (code) {
      // 카카오 로그인 후 서버에서 인증 처리
      fetch(`${import.meta.env.VITE_NODE_SERVER_URL}/kakao/login?code=${code}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.accessToken) {
            // JWT 토큰을 로컬 스토리지에 저장
            localStorage.setItem("accessToken", data.accessToken);
            console.log("Saved Token:", localStorage.getItem("accessToken"));  // 저장된 토큰을 확인
            // 메인 페이지로 리다이렉트
            navigate("/");
          } else {
            alert("카카오 로그인 실패");
          }
        })
        .catch((error) => {
          console.error("카카오 로그인 오류:", error);
          alert("카카오 로그인 오류");
        });
    }
  }, [navigate]);

  const handleKakaoLogin = () => {
    window.location.href = kakaoLoginUrl;
  };

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
            : "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
          alert(userMessage);
        },
      })
    ).then(() => {
      navigate("/");
    });

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
      icon: "PERSON_SVG",
      type: "text",
      placeholder: "아이디",
      name: "email",
      value: loginData.email,
      onChange: handleChange
    },
    {
      icon: "LOCK_SVG",
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
          <div  className="loginInputBox">
            <InputBox data={data} handleChange={handleChange} />
          </div>
          <button className="loginSubmitBtn" type="submit">로그인</button>
          <div className="loginButton">
            <img 
              src={kakaoLogin} 
              alt="카카오 로그인"
              onClick={handleKakaoLogin}
              style={{ cursor: 'pointer' }} 
            />
            <Button btnData={btnData} />
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
