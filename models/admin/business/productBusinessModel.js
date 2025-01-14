import mongoose from 'mongoose'
import { DbConnection } from '../../../config/dbConnections.js'

const productSchema = new mongoose.Schema({
    reOrderLevel: {
        type: Number,
        default: 10,
        required: [true, 'Please provide reorder level'],
    },
    sellDigitalProduct: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
        required: [
            true,
            'Please specify if selling digital product is active or inactive',
        ],
    },
    showBrand: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
        required: [
            true,
            'Please specify if showing brand is active or inactive',
        ],
    },
})

// Create the model using DbConnection
const ProductBusiness = DbConnection.model('ProductBusiness', productSchema)

export default ProductBusiness
