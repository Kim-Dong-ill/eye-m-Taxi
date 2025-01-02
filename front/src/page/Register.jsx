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

  // 아이디(이메일) 유효성 검사
  const handleUserIdChange = (e) => {
    const value = e.target.value;
    setUserId(value);

    if (value.length === 0) {
      setUserIdError(false);
      setUserIdErrorMessage("");
      return;
    }

    validateUserId(value);
  };

  // 이메일 유효성 검사 함수
  const validateUserId = (value) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!emailRegex.test(value)) {
      setUserIdError(true);
      setUserIdErrorMessage("올바른 이메일 형식이 아닙니다.");
    } else {
      setUserIdError(false);
      setUserIdErrorMessage("");
    }
  };

  // 아이디 입력 필드 포커스 해제 시 검사
  const handleUserIdBlur = () => {
    if (userId) {
      validateUserId(userId);
    }
  };

  // 비밀번호 유효성 검사 
  const validatePassword = (value) => {
    const hasLetter = /[A-Za-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    return hasLetter && hasNumber && hasSpecial;
  };

    // 비밀번호 유효성 검사
    const handlePasswordChange = (e) => {
      const value = e.target.value;
      setPassword(value);

      if (value.length === 0) {
        setPasswordError(false);
        setPasswordErrorMessage("");
        return;
      }

      // 비밀번호 형식 검사
      if (!validatePassword(value)) {
        setPasswordError(true);
        setPasswordErrorMessage("영문, 숫자, 특수문자를 모두 포함해야 합니다.");
      } else if (confirmPassword) {
        // 비밀번호 확인과 일치 여부 검사
        if (value !== confirmPassword) {
          setPasswordError(true);
          setPasswordErrorMessage("비밀번호가 일치하지 않습니다.");
        } else {
          setPasswordError(false);
          setPasswordErrorMessage("");
        }
      } else {
        setPasswordError(false);
        setPasswordErrorMessage("");
      }
    };
  
    const handleConfirmPasswordChange = (e) => {
      const value = e.target.value;
      setConfirmPassword(value);

      if (value.length === 0) {
        setPasswordError(false);
        setPasswordErrorMessage("");
        return;
      }

      // 원래 비밀번호의 형식 검사
      if (!validatePassword(password)) {
        setPasswordError(true);
        setPasswordErrorMessage("영문, 숫자, 특수문자를 모두 포함해야 합니다.");
        return;
      }

      // 비밀번호 일치 여부 검사
      if (password !== value) {
        setPasswordError(true);
        setPasswordErrorMessage("비밀번호가 일치하지 않습니다.");
      } else {
        setPasswordError(false);
        setPasswordErrorMessage("");
      }
    };

    const handlePasswordBlur = () => {
      if (password) {
        if (!validatePassword(password)) {
          setPasswordError(true);
          setPasswordErrorMessage("영문, 숫자, 특수문자를 모두 포함해야 합니다.");
        } else if (confirmPassword && password !== confirmPassword) {
          setPasswordError(true);
          setPasswordErrorMessage("비밀번호가 일치하지 않습니다.");
        }
      }
    };

    const handleConfirmPasswordBlur = () => {
      if (confirmPassword) {
        if (!validatePassword(password)) {
          setPasswordError(true);
          setPasswordErrorMessage("영문, 숫자, 특수문자를 모두 포함해야 합니다.");
        } else if (password !== confirmPassword) {
          setPasswordError(true);
          setPasswordErrorMessage("비밀번호가 일치하지 않습니다.");
        }
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
      placeholder: "아이디(메일 형식)",
      onChange: handleUserIdChange,
      onBlur: handleUserIdBlur,
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
