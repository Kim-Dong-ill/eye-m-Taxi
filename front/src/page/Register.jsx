import React, { useState } from "react";
import InputBox from "../components/InputBox";
import Button from "../components/button";
import "../css/register.scss";
import user from "../../public/icon/Person.svg";
import lock from "../../public/icon/Lock.svg";
import phone from "../../public/icon/Phone.svg";

function Register() {

  const [userId, setUserId] = useState("");
  const [userIdError, setUserIdError] = useState(false);
  const [userIdErrorMessage, setUserIdErrorMessage] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  // 아이디 유효성 검사
  const handleUserIdChange = (e) => {
    const value = e.target.value;
    setUserId(value);

    // 영문, 숫자만 허용하는 정규식
    const isValidFormat = /^[A-Za-z0-9]*$/.test(value);
    // 영문, 숫자 각각 1개 이상 포함하는지 체크
    const hasLetter = /[A-Za-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    if (!isValidFormat) {
      setUserIdError(true);
      setUserIdErrorMessage("영문과 숫자만 입력 가능합니다.");
    } else if (value.length > 0 && (!hasLetter || !hasNumber)) {
      setUserIdError(true);
      setUserIdErrorMessage("영문과 숫자를 모두 포함해야 합니다.");
    } else {
      setUserIdError(false);
      setUserIdErrorMessage("");
    }
  };

  // 비밀번호 일치 여부 확인
  const checkPasswordMatch = (password, confirmPassword) => {
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError(true);
      setPasswordErrorMessage("비밀번호가 일치하지 않습니다.");
      return false;
    }
    return true;
  };

  // 비밀번호 유효성 검사
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    // 영문, 숫자, 특수문자 검사를 위한 정규식
    const hasLetter = /[A-Za-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (value.length > 0) {
      if (!hasLetter || !hasNumber || !hasSpecial) {
        setPasswordError(true);
        setPasswordErrorMessage("영문, 숫자, 특수문자를 모두 포함해야 합니다.");
      } else {
        setPasswordError(false);
        setPasswordErrorMessage("");
      }
    }

    // 비밀번호 확인과 일치 여부 체크
    checkPasswordMatch(value, confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (checkPasswordMatch(password, value)) {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }
  };

  // 전화번호 유효성 검사
  const handlePhoneInput = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    e.target.value = value;
  };


  const data = [
    {
      img: user,
      type: "text",
      placeholder: "아이디(영문과 숫자를 포함한 8자 이내)",
      maxLength: 8,
      onChange: handleUserIdChange,
      value: userId
    },
    {
      img: lock,
      type: "password",
      placeholder: "비밀번호(영문, 숫자, 특수문자 포함 8자 이내)",
      maxLength: 8,
      onChange: handlePasswordChange,
      value: password,
    },
    {
      img: lock,
      type: "password",
      placeholder: "비밀번호 확인",
      maxLength: 8,
      onChange: handleConfirmPasswordChange,
      value: confirmPassword,
    },
    {
      img: phone,
      type: "text",
      placeholder: "전화번호(숫자만 입력)",
      maxLength: 11,
      onInput: handlePhoneInput,
    },
  ];

  const btnData = {
    text: "회원가입",
    link: "/login"
  }

  return (
    <div className="register">
      <div className="registerContainer">
        <div>
          <InputBox data={data} />
          {userIdError && (
            <p className="error-message">{userIdErrorMessage}</p>
          )}
          {passwordError && (
            <p className="error-message">{passwordErrorMessage}</p>
          )}
        </div>
        <div className="registerButton">
          <Button btnData={btnData} />
        </div>
      </div>
    </div>
  );
}

export default Register;
