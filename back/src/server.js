import express from 'express'
import cors from 'cors'
import mountRouter from './api/routers/router.js'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

mountRouter(app)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})