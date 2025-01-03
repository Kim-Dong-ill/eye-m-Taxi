import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ message: '인증 토큰이 필요합니다.' })
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: '유효하지 않은 토큰입니다.' })
        }

        req.user = user
        next()
    })
}