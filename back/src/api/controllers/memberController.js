import memberService from "../services/memberService.js";
import jwt from "jsonwebtoken";
import axios from "axios"
import { access } from "fs";

// 회원가입
const memberRegister = async (req, res) => {
  try {
    const data = req.body;

    const result = await memberService.memberRegister(data);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "register error",
      error: error.message,
    });
  }
};

// 로그인
const memberLogin = async (req, res) => {
  try {
    console.log(req.body);
    const data = req.body;
    const result = await memberService.memberLogin(data);
    const token = jwt.sign({ userId: result.userId }, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });
    res.send(
      {
        message: result.message,
        accessToken: token,
        userId: result.userId,
        phone: result.phone,
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "login error",
      error: error.message,
    });
  }
};

// 인증
const authUser = async (req, res) => {
  res.send({ message: "인증 성공" });
};

// 카카오 로그인
const loginWithKakao = async (req, res) => {
  const { code } = req.query; // 클라이언트로부터 인증 코드 수신

  console.log(code)

  let access_token; // 블록 밖에 변수 선언

  try {
    // 카카오 토큰 요청
    const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code, // 인가 코드
      },
    });

    access_token = tokenResponse.data.access_token; // 블록 외부 변수에 값 할당
    // const { access_token } = tokenResponse.data;
    console.log("카카오 액세스 토큰:", access_token);
  } catch (error) {
    console.error("토큰 요청 중 오류:", error.response?.data || error.message);
  }

  try {
    // 카카오 사용자 정보 요청
    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    console.log("카카오 사용자 정보:", userResponse.data);

    //   res.status(200).json(userResponse.data); // 사용자 정보 응답 반환
    // } catch (error) {
    //   console.error("사용자 정보 요청 중 오류:", error.response?.data || error.message);
    //   res.status(500).json({ message: "사용자 정보를 가져오는 중 오류가 발생했습니다." });
    // }

    // 사용자 정보를 저장 또는 로그인 처리
    const kakaoUser = {
      kakao_id: userResponse.data.id, // 카카오 고유 ID
      // nickname: userResponse.data.properties.nickname || `사용자_${userResponse.data.id}`, // 닉네임
      // profileImage: userResponse.data.properties.profile_image || null, // 프로필 이미지
    };

    // 데이터베이스에서 사용자 찾기 또는 생성
    const result = await memberService.findOrCreateKakaoUser(kakaoUser);

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: result.member_id || null, kakaoId: result.kakao_id // 데이터베이스에 저장된 사용자 ID
        // nickname: result.nickname,
      },
      process.env.JWT_SECRET, // .env 파일에 저장된 비밀키
      { expiresIn: "1h" } // 토큰 만료 시간 (예: 1시간)
    );

    // 로그인 성공 후 클라이언트로 응답 반환
    // res.status(200).json({
    //   message: "카카오 로그인 성공",
    //   accessToken: token, // 클라이언트에 JWT 토큰 전달
    //   kakaoId: result.kakao_id,
    //   // nickname: userResponse.data.properties.nickname || null, // 닉네임을 응답으로만 포함
    // });
    const redirectUrl = `http://localhost:5173/kakao/callback?accessToken=${token}`;
    res.redirect(redirectUrl); // accessToken을 URL 쿼리 파라미터로 전달하고 리디렉션

  } catch (error) {
    console.error("사용자 정보 요청 중 오류:", error.response?.data || error.message);
    res.status(500).json({ message: "사용자 정보를 가져오는 중 오류가 발생했습니다." });
  }
};

export default {
  memberRegister,
  memberLogin,
  loginWithKakao,
  authUser,
};