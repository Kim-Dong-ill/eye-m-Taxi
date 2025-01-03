import memberDao from '../dao/memberDao.js'
import bcrypt from 'bcrypt'
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

export default {
    memberRegister,
    memberLogin
}
