import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function KakaoRedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKakaoRedirect = async () => {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get("accessToken");  // URL 파라미터로 받은 accessToken

      if (accessToken) {
        try {
          // 액세스 토큰 저장 (로컬 스토리지 또는 상태 관리)
          localStorage.setItem("accessToken", accessToken);

          // 성공적으로 액세스 토큰을 받았으면 메인 페이지로 리디렉션
          navigate("/");  // 메인 페이지로 리디렉션
        } catch (error) {
          console.error("카카오 로그인 처리 중 오류:", error);
          alert("카카오 로그인 처리 중 오류가 발생했습니다.");
          navigate("/login");
        }
      } else {
        // 인증 코드가 없거나 오류가 있으면 로그인 페이지로 리디렉션
        alert("로그인 실패 또는 취소되었습니다.");
        navigate("/login");
      } 
    };

    handleKakaoRedirect();  // 컴포넌트 마운트 시 실행
  }, [navigate]);

  return <div>카카오 로그인 처리 중...</div>;
}

export default KakaoRedirectHandler;