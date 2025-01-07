import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mountRouter from './api/routers/router.js'

const app = express()
const port = process.env.PORT || 3000

// NODE_ENV에 따라 다른 환경 파일 로드
dotenv.config({
  path: process.env.NODE_ENV === 'production' 
      ? '.env.production'
      : '.env'
})

// CORS 설정
app.use(cors({
    origin: process.env.CORS_ORIGIN, // 프론트엔드 주소
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
app.use(express.json())

mountRouter(app)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
  console.log(`Environment: ${process.env.NODE_ENV}`)
  console.log(`CORS Origin: ${process.env.CORS_ORIGIN}`)
})