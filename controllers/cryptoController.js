import Crypto from '../models/Crypto.js'

export const getCryptos = async (_req, res, next) => {
  try {
    const cryptos = await Crypto.find().sort({ createdAt: -1 })
    return res.status(200).json(cryptos)
  } catch (error) {
    next(error)
  }
}

export const getGainers = async (_req, res, next) => {
  try {
    const cryptos = await Crypto.find({ change24h: { $gt: 0 } }).sort({ change24h: -1 })
    return res.status(200).json(cryptos)
  } catch (error) {
    next(error)
  }
}

export const getNewCryptos = async (_req, res, next) => {
  try {
    const cryptos = await Crypto.find().sort({ createdAt: -1 }).limit(20)
    return res.status(200).json(cryptos)
  } catch (error) {
    next(error)
  }
}

export const createCrypto = async (req, res, next) => {
  try {
    const { name, symbol, price, image, change24h } = req.body

    if (!name?.trim() || !symbol?.trim() || price === undefined || change24h === undefined) {
      return res.status(400).json({ message: 'Name, symbol, price, and change24h are required' })
    }

    const crypto = await Crypto.create({
      name: name.trim(),
      symbol: symbol.trim().toUpperCase(),
      price,
      image: image?.trim() || '',
      change24h,
    })

    return res.status(201).json({
      message: 'Cryptocurrency added successfully',
      crypto,
    })
  } catch (error) {
    next(error)
  }
}
