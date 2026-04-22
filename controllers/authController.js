import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

const createToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  )

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    })

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() })

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = createToken(user)
    res.cookie('token', token, cookieOptions)

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password')

    if (!user) {
      return res.status(401).json({ message: 'User not found for this token' })
    }

    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    })
  } catch (error) {
    next(error)
  }
}

export const logoutUser = async (_req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    })

    return res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
}
