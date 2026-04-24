import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const ATLAS_MONGO_URI = process.env.MONGO_URI

const verify = async () => {
  if (!ATLAS_MONGO_URI) {
    throw new Error('MONGO_URI is not defined in .env')
  }

  const connection = await mongoose.createConnection(ATLAS_MONGO_URI).asPromise()

  try {
    const collections = await connection.db.listCollections().toArray()

    if (collections.length === 0) {
      console.log('Atlas is reachable, but no collections were found.')
      return
    }

    for (const { name } of collections) {
      if (name.startsWith('system.')) {
        continue
      }

      const count = await connection.db.collection(name).countDocuments()
      const label = name.charAt(0).toUpperCase() + name.slice(1)
      console.log(`✅ ${label}: ${count} document(s) on Atlas`)
    }

    console.log('Atlas verification completed successfully.')
  } finally {
    await connection.close()
  }
}

verify()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Atlas verification failed:', error.message)
    process.exit(1)
  })
