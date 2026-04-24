import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Crypto from '../models/Crypto.js'

dotenv.config()

const LOCAL_MONGO_URI =
  process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/coinbase_demo_student'
const ATLAS_MONGO_URI = process.env.MONGO_URI

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

const makeFilter = (collectionName, document) => {
  if (collectionName === 'users' && document.email) {
    return { email: document.email }
  }

  if (collectionName === 'cryptos' && document.symbol) {
    return { symbol: document.symbol }
  }

  return { _id: document._id }
}

const summarizeCollections = async (db) => {
  const collections = await db.listCollections().toArray()
  const summaries = []

  for (const { name } of collections) {
    if (name.startsWith('system.')) {
      continue
    }

    const count = await db.collection(name).countDocuments()
    summaries.push({ name, count })
  }

  return summaries
}

const seedAtlas = async () => {
  const atlasConnection = await mongoose.createConnection(ATLAS_MONGO_URI).asPromise()

  try {
    const AtlasCrypto = atlasConnection.model(Crypto.modelName, Crypto.schema)
    const existingCount = await AtlasCrypto.countDocuments()

    if (existingCount > 0) {
      console.log(
        `Atlas cryptos collection already has ${existingCount} document(s); skipping seed insert.`,
      )
      return
    }

    const result = await AtlasCrypto.insertMany(seedData, { ordered: true })
    console.log(`Local database is empty. Seeded ${result.length} crypto document(s) to Atlas.`)
  } finally {
    await atlasConnection.close()
  }
}

const migrate = async () => {
  if (!ATLAS_MONGO_URI) {
    throw new Error('MONGO_URI is not defined in .env')
  }

  const localConnection = await mongoose.createConnection(LOCAL_MONGO_URI).asPromise()
  const atlasConnection = await mongoose.createConnection(ATLAS_MONGO_URI).asPromise()

  try {
    const localDb = localConnection.db
    const atlasDb = atlasConnection.db
    const localCollections = await summarizeCollections(localDb)

    const totalLocalDocuments = localCollections.reduce((sum, entry) => sum + entry.count, 0)

    if (totalLocalDocuments === 0) {
      console.log(`No documents found in local database at ${LOCAL_MONGO_URI}.`)
      await seedAtlas()
      return
    }

    for (const { name, count } of localCollections) {
      console.log(`Found ${count} document(s) in local collection "${name}".`)

      const localDocuments = await localDb.collection(name).find({}).toArray()

      if (localDocuments.length === 0) {
        console.log(`Skipping "${name}" because it is empty.`)
        continue
      }

      await atlasDb.createCollection(name).catch((error) => {
        if (error.codeName !== 'NamespaceExists') {
          throw error
        }
      })

      let insertedCount = 0
      let updatedCount = 0

      for (const document of localDocuments) {
        const result = await atlasDb.collection(name).replaceOne(
          makeFilter(name, document),
          document,
          { upsert: true },
        )

        insertedCount += result.upsertedCount ?? 0
        updatedCount += result.modifiedCount ?? 0
      }

      console.log(
        `Atlas "${name}": processed ${localDocuments.length}, inserted ${insertedCount}, updated ${updatedCount}.`,
      )
    }
  } finally {
    await localConnection.close()
    await atlasConnection.close()
  }
}

migrate()
  .then(() => {
    console.log('Migration completed successfully.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error.message)
    process.exit(1)
  })
