import express from 'express'
import {
  createCrypto,
  getCryptos,
  getGainers,
  getNewCryptos,
} from '../controllers/cryptoController.js'

const router = express.Router()

router.get('/', getCryptos)
router.get('/gainers', getGainers)
router.get('/new', getNewCryptos)
router.post('/', createCrypto)

export default router
