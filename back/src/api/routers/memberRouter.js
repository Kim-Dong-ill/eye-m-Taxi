import express from 'express'
import memberController from '../controllers/memberController.js'


const router = express.Router()

router.get('/', memberController.test)

export default router;
