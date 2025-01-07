import pg from 'pg'
import dotenv from 'dotenv'

// NODE_ENV에 따라 다른 환경 파일 로드
dotenv.config({
    path: process.env.NODE_ENV === 'production' 
        ? '.env.production'
        : '.env'
})

const dbConfig =  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
}

export const db = new pg.Pool(dbConfig)

export const schema = process.env.DB_SCHEMA
