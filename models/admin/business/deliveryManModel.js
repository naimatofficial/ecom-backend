import mongoose from 'mongoose'
import { DbConnection } from '../../../config/dbConnections.js'

const deliveryManSchema = new mongoose.Schema(
    {
        uploadPictureOnDelivery: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'inactive',
            required: [
                true,
                'Please specify if uploading picture on delivery is active or inactive',
            ],
        },
    },
    {
        timestamps: true,
    }
)

const DeliveryMan = DbConnection.model('DeliveryMan', deliveryManSchema)

export default DeliveryMan
