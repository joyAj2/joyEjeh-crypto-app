import mongoose from 'mongoose'

const cryptoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    change24h: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const Crypto = mongoose.model('Crypto', cryptoSchema)

export default Crypto
