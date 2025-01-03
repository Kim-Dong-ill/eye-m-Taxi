import express from 'express'
import memberController from '../controllers/memberController.js'
import { authenticateToken } from '../../utils/authMiddleware.js'


const router = express.Router()

// 회원가입
router.post('/register', memberController.memberRegister)

// 로그인
router.post('/login', memberController.memberLogin)

// 인증
router.get('/auth', authenticateToken, memberController.authUser)

// 인증이 필요한 보호된 라우트 예시
// router.get('/profile', authenticateToken, memberController.getProfile)
// router.put('/update', authenticateToken, memberController.updateProfile)
export default router;
