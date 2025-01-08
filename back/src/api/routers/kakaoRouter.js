import express from 'express';
import memberController from '../controllers/memberController.js';

const router = express.Router();

//카카오 로그인
router.get('/login', memberController.loginWithKakao);
  

export default router;
