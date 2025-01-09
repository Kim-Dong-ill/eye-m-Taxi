import pg from 'pg'
import dotenv from 'dotenv'

// NODE_ENV에 따라 다른 환경 파일 로드
dotenv.config({
    path: process.env.NODE_ENV === 'production' 
        ? '.env.production'
        : '.env'
})

let dbConfig;

if (process.env.NODE_ENV === 'production') {
    dbConfig = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: '/cloudsql/winged-woods-442503-f1:asia-northeast3:codelab',
        // Unix 도메인 소켓을 사용하므로 port는 필요 없음
    }
} else {
    dbConfig = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    }
}

export const db = new pg.Pool(dbConfig)

export const schema = process.env.DB_SCHEMA
