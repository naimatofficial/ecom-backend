import mongoose from 'mongoose'
import { DbConnection } from '../../../config/dbConnections.js'

const inHouseShopSchema = new mongoose.Schema({
    shopCoverImage: {
        type: String,
        required: [true, 'Please provide shop cover image'],
        trim: true,
    },
    visitWebsiteLink: {
        type: String,
        required: [true, 'Please provide website link'],
        trim: true,
    },
})

// Create the model using DbConnection
const InHouseShop = DbConnection.model('InHouseShop', inHouseShopSchema)

export default InHouseShop
