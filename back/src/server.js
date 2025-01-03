import express from 'express'
import cors from 'cors'
import mountRouter from './api/routers/router.js'

const app = express()
const port = process.env.PORT || 3000

// CORS 설정
app.use(cors({
    origin: 'http://localhost:5173', // 프론트엔드 주소
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
app.use(express.json())

mountRouter(app)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})