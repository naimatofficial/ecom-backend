import mongoose from 'mongoose'
// import Vendor from './vendorModel.js'
// import { checkReferenceId } from '../../utils/helpers.js'
import { sellerDbConnection } from '../../config/dbConnections.js'

const shippingInfoSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: [true, 'Please provide vendor id.'],
        },
        pickingAddressId: {
            type: Number,
            required: [true, 'Please provide picking address id.'],
        },
        originCityId: {
            type: Number,
            required: [true, 'Please provide picking origin city id.'],
        },
        shippingMethod: {
            type: String,
            required: [true, 'Please provide shipping method.'],
        },
    },
    {
        timestamps: true,
    }
)

// Pre-save hook to check if the vendor exists before saving
// shippingInfoSchema.pre('save', async function (next) {
//     await checkReferenceId(Vendor, this.vendorId, next)

//     next()
// })

const ShippingInfo = sellerDbConnection.model(
    'ShippingInfo',
    shippingInfoSchema
)

export default ShippingInfo
