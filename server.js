import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import cryptoRoutes from './routes/cryptoRoutes.js'
import Crypto from './models/Crypto.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

const seedData = [
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 67432.18,
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    change24h: 2.34,
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3521.44,
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    change24h: 1.89,
  },
  {
    name: 'BNB',
    symbol: 'BNB',
    price: 612.33,
    image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    change24h: 0.56,
  },
  {
    name: 'Solana',
    symbol: 'SOL',
    price: 231.66,
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    change24h: -0.84,
  },
  {
    name: 'Cardano',
    symbol: 'ADA',
    price: 0.91,
    image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    change24h: -1.32,
  },
  {
    name: 'Dogecoin',
    symbol: 'DOGE',
    price: 0.38,
    image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    change24h: 5.12,
  },
  {
    name: 'XRP',
    symbol: 'XRP',
    price: 1.24,
    image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    change24h: 4.08,
  },
  {
    name: 'Avalanche',
    symbol: 'AVAX',
    price: 42.18,
    image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
    change24h: -2.11,
  },
  {
    name: 'Polygon',
    symbol: 'MATIC',
    price: 0.62,
    image: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
    change24h: 1.88,
  },
  {
    name: 'Chainlink',
    symbol: 'LINK',
    price: 18.92,
    image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    change24h: 3.45,
  },
]

const seedDB = async () => {
  const count = await Crypto.countDocuments()
  if (count > 0) {
    return
  }

  await Crypto.insertMany(seedData)
  console.log('Seeded initial cryptocurrency data')
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(cookieParser())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.status(200).json({ message: 'Server is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/crypto', cryptoRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)

  if (res.headersSent) {
    return
  }

  res.status(500).json({
    message: err.message || 'Internal server error',
  })
})

const startServer = async () => {
  try {
    await connectDB()
    await seedDB()
    app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()
