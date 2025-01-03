import mongoose from 'mongoose'
import { DbConnection } from '../../../config/dbConnections.js'

const deliveryRestrictionSchema = new mongoose.Schema(
    {
        deliveryAvailableCountry: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'inactive',
            required: [
                true,
                'Please specify if delivery is available by country.',
            ],
        },
        deliveryAvailableZipCodeArea: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'inactive',
            required: [
                true,
                'Please specify if delivery is available by zip code area.',
            ],
        },
    },
    {
        timestamps: true,
    }
)

const DeliveryRestriction = DbConnection.model(
    'DeliveryRestriction',
    deliveryRestrictionSchema
)

export default DeliveryRestriction
