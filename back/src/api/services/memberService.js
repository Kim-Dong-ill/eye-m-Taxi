import memberDao from '../dao/memberDao.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// 회원가입
const memberRegister = async (data) => {
    try {
        const password = await bcrypt.hash(data.password, 10)
        data.password = password
        const result = await memberDao.memberRegister(data)
        return result
    } catch (error) {
        console.log(error);
        throw error
    }
}

// 로그인
const memberLogin = async (data) => {
    try {
        const result = await memberDao.memberLogin(data)
        return result
    } catch (error) {
        console.log(error);
        throw error
    }
}

// 카카오 로그인 - 사용자 생성 또는 기존 사용자 찾기
const findOrCreateKakaoUser = async (kakaoUser) => {
    try {
        // 1. 데이터베이스에서 카카오 ID로 사용자 검색
        let user = await memberDao.findUserByKakaoId(kakaoUser.kakao_id);

        // 2. 사용자가 없으면 새로 생성
        if (!user) {
            const data = {
                kakao_id: kakaoUser.kakao_id,
                // nickname: kakaoUser.nickname,
                // profileImage: kakaoUser.profileImage,
            };
            user = await memberDao.registerKakaoUser(data);
        }

    //    // 3. JWT 토큰 생성 (기존 사용자 또는 새로 생성된 사용자에 대해)
    //    const token = jwt.sign({ userId: user.member_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

       return {
           member_id: user.member_id,
        //    nickname: user.nickname,
       };
   } catch (error) {
        console.error("카카오 사용자 등록 또는 검색 중 오류:", error.message);
        throw error;
   }
};
 
export default {
    memberRegister,
    memberLogin,
    findOrCreateKakaoUser,
}
