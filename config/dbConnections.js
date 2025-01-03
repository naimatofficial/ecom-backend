import mongoose from 'mongoose'
import keys from './keys.js'

mongoose.set('strictQuery', false) // Disable strict mode for queries (optional)

function createConnection(uri) {
    return mongoose.createConnection(uri, {
        maxPoolSize: 10, // Adjust based on server load
        minPoolSize: 2, // Helps keep connections alive
        connectTimeoutMS: 10000, // Connection timeout (10 seconds)
        socketTimeoutMS: 45000, // Socket timeout (45 seconds)
        serverSelectionTimeoutMS: 10000, // Server selection timeout (5 seconds)
    })
}
// DB connection
export const DbConnection = createConnection(keys.dbURI)

DbConnection.on('connected', () => console.log('Databse connected'))
DbConnection.on('disconnected', () => console.log('Database disconnected'))
DbConnection.on('error', (err) =>
    console.log('Database connection error:', err)
)

// Graceful shutdown
process.on('SIGINT', async () => {
    await DbConnection.close()
    process.exit(0)
})
