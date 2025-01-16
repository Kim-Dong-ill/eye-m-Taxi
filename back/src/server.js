import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mountRouter from './api/routers/router.js'

// NODE_ENV에 따라 다른 환경 파일 로드
dotenv.config({
  path: process.env.NODE_ENV === 'production' 
      ? '.env.production'
      : '.env'
})

const app = express()
const port = process.env.PORT || 3000


// CORS 설정
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || [  // 여러 도메인 지원
    'https://eyemtaxi-front-dot-winged-woods-442503-f1.du.r.appspot.com',
    'https://eyemtaxi-back-dot-winged-woods-442503-f1.du.r.appspot.com',  // 백엔드 도메인 추가
    'https://kauth.kakao.com',                    // 카카오 인증 도메인
    'http://localhost:5173',
    'http://192.168.106.239:5173',    // USB 테더링 IP
    'http://192.168.0.144:5173'       // 이더넷 IP
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],  // 'Accept' 헤더 추가
  exposedHeaders: ['Authorization'],                           // JWT 토큰을 위한 헤더 노출
  optionsSuccessStatus: 200 // OPTIONS 요청에 대한 성공 상태 코드
}));


app.use(express.json())

mountRouter(app)

app.listen(port, '0.0.0.0',() => {
  console.log(`Server is running on port ${port}`)
  console.log(`Environment: ${process.env.NODE_ENV}`)
  console.log(`CORS Origin: ${process.env.CORS_ORIGIN}`)
})