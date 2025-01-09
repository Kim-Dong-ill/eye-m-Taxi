import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputBox from "../components/InputBox";
import Button from "../components/button";
import "../css/register.scss";
import user from "/icon/Person.svg";
import lock from "/icon/Lock.svg";
import phone from "/icon/Phone.svg";
import axios from "axios"

function Register() {

  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [userIdError, setUserIdError] = useState(false);
  const [userIdErrorMessage, setUserIdErrorMessage] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState(false);
  const [phoneNumberErrorMessage, setPhoneNumberErrorMessage] = useState("");

  const [formError, setFormError] = useState("");

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

  // 전화번호 유효성 검사
  const handlePhoneInput = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPhoneNumber(value);
    
    if (value.length === 0) {
      setPhoneNumberError(false);
      setPhoneNumberErrorMessage("");
      return;
    }
  
    if (value.length !== 11) {
      setPhoneNumberError(true);
      setPhoneNumberErrorMessage("전화번호는 11자리를 입력해주세요.");
    } else {
      setPhoneNumberError(false);
      setPhoneNumberErrorMessage("");
    }
  };

// 모든 유효성 검사가 통과되었는지 확인하는 함수
const isFormValid = () => {
  // 각 필드의 현재 상태 로깅
  console.log('Form State:', {
    userId,
    password,
    confirmPassword,
    phoneNumber,
    userIdError,
    passwordError,
    formError
  });

  // 1. 필수 필드 검사
  if (!userId || !password || !confirmPassword || !phoneNumber) {
    console.log('필수 필드 누락');
    // setFormError("모든 항목을 입력해주세요.");
    return false;
  }

  // 2. 이메일 형식 검사
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(userId)) {
    console.log('이메일 형식 오류');
    // setFormError("올바른 이메일 형식이 아닙니다.");
    return false;
  }

  // 3. 비밀번호 유효성 검사
  if (!validatePassword(password)) {
    console.log('비밀번호 형식 오류');
    return false;
  }

  // 4. 비밀번호 일치 검사
  if (password !== confirmPassword) {
    console.log('비밀번호 불일치');
    return false;
  }

  // 5. 전화번호 길이 검사
  if (phoneNumber.length !== 11) {
    console.log('전화번호 길이 오류');
    return false;
  }

  console.log('모든 유효성 검사 통과!');
  setFormError("");
  return true;
};

const handleRegister = async () => {
  const isValid = isFormValid();

  if (isValid) {
    console.log("userId:", userId); // 로그 추가
    console.log("password:", password); // 로그 추가
    console.log("phoneNumber:", phoneNumber); // 로그 추가

    try {
      const response = await axios.post('http://localhost:3000/member/register', {
        userId,
        password,
        phoneNumber
      });

      console.log('Response:', response); // 응답 로그
      if (response.data.success) {
        // 회원가입 성공 시 로그인 페이지로 이동
        navigate('/login', { replace: true });
      } else {
        setFormError(response.data.message || "회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error('회원가입 API 요청 실패:', error);
      setFormError("서버에 문제가 발생했습니다. 다시 시도해주세요.");
    }
  } else {
    console.log('유효성 검사 실패');
  }
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
      value: phoneNumber,
    },
  ];

  const btnData = {
    text: "회원가입",
    // link: "/login",
    onClick: handleRegister
    };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   console.log(userId);
  //   console.log(password);
  // }

  return (
    <div className="register">
      <div className="registerContainer">
        <div className="registerInputBox">
          <InputBox data={data} />
          {userIdError && (
            <p className="error-message">{userIdErrorMessage}</p>
          )}
          {passwordError && (
            <p className="error-message">{passwordErrorMessage}</p>
          )}
          {phoneNumberError && (
          <p className="error-message">{phoneNumberErrorMessage}</p>
          )}
          {formError && (
            <p className="error-message">{formError}</p>
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
