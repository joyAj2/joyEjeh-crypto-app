import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import {
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
} from '../controllers/authController.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', authMiddleware, getProfile)
router.post('/logout', logoutUser)

export default router
