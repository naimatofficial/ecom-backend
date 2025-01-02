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
// UserDB connection
export const userDbConnection = createConnection(keys.userDbURI)
userDbConnection.on('connected', () => console.log('UserDB connected'))
userDbConnection.on('disconnected', () => console.log('UserDB disconnected'))
userDbConnection.on('error', (err) =>
    console.log('UserDB connection error:', err)
)

// AdminDB connection
export const adminDbConnection = createConnection(keys.adminDbURI)
adminDbConnection.on('connected', () => console.log('AdminDB connected'))
adminDbConnection.on('disconnected', () => console.log('AdminDB disconnected'))
adminDbConnection.on('error', (err) =>
    console.log('AdminDB connection error:', err)
)

// TransactionDB connection
export const transactionDbConnection = createConnection(keys.transcationDbURI)
transactionDbConnection.on('connected', () =>
    console.log('TransactionDB connected')
)
transactionDbConnection.on('disconnected', () =>
    console.log('TransactionDB disconnected')
)
transactionDbConnection.on('error', (err) =>
    console.log('TransactionDB connection error:', err)
)

// SellerDB connection
export const sellerDbConnection = createConnection(keys.sellerDbURI)
sellerDbConnection.on('connected', () => console.log('SellerDB connected'))
sellerDbConnection.on('disconnected', () =>
    console.log('SellerDB disconnected')
)
sellerDbConnection.on('error', (err) =>
    console.log('SellerDB connection error:', err)
)

// Graceful shutdown
process.on('SIGINT', async () => {
    await userDbConnection.close()
    await adminDbConnection.close()
    await transactionDbConnection.close()
    await sellerDbConnection.close()
    process.exit(0)
})
