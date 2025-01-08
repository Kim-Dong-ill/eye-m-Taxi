import { db, schema } from "../../config/dbConfig.js";
import bcrypt from "bcrypt";

// 회원가입
const memberRegister = async (data) => {
  const query = `
    INSERT INTO ${schema}.member (member_id, member_password, member_phone)
    VALUES ($1, $2, $3)
`;
  try {
    const result = await db.query(query, [
      data.email,
      data.password,
      data.phone,
    ]);
    const message = "회원가입 완료";
    return message;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// 로그인
const memberLogin = async (data) => {
  const query = `
      SELECT member_id, member_password, member_phone
      FROM ${schema}.member 
      WHERE member_id = $1
    `;

  try {
    const result = await db.query(query, [data.email]);

    if (result.rows.length === 0) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    const user = result.rows[0];
    console.log(user);
    const isPasswordMatch = await bcrypt.compare(
      data.password,
      user.member_password
    );
    if (!isPasswordMatch) {
      throw new Error("비밀번호가 일치하지 않습니다.");
    }

    return {
      message: "로그인 성공",
      userId: user.member_id,
      phone: user.member_phone,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// 카카오 ID로 사용자 검색
const findUserByKakaoId = async (kakaoId) => {
  const query = `
    SELECT member_id, kakao_id
    FROM ${schema}.member
    WHERE kakao_id = $1
  `;
  try {
    const result = await db.query(query, [kakaoId]);
    return result.rows[0] || null; // 사용자 정보 반환 (없으면 undefined)
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// 카카오 사용자 등록
const registerKakaoUser = async (data) => {

  const query = `
    INSERT INTO ${schema}.member (kakao_id, created_at, updated_at)
    VALUES ($1, NOW(), NOW())
    RETURNING member_id
  `;
  try {
    const result = await db.query(query, [data.kakao_id]);

    if (!result.rows[0]) {
      throw new Error("사용자 등록 실패: 반환된 데이터가 없습니다.");
    }
      
    return { member_id: result.rows[0].member_id, kakao_id: data.kakao_id }; 
  } catch (error) {
    console.log("카카오 로그인 오류", error.response?.data || error.message);
    throw error;
  }
};

export default {
  memberRegister,
  memberLogin,
  findUserByKakaoId, // 추가
  registerKakaoUser, // 추가
  
};
