import mongoose from 'mongoose'
import { checkReferenceId } from '../../utils/helpers.js'
import { sellerDbConnection } from '../../config/dbConnections.js'
import Vendor from './vendorModel.js'

const vendorBankSchema = new mongoose.Schema(
    {
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: [true, 'Please provide vendor ID.'],
            unique: true,
        },
        holderName: {
            type: String,
            required: [true, 'Please provide holder name.'],
            trim: true,
        },
        bankName: {
            type: String,
            required: [true, 'Please provide bank name.'],
            trim: true,
        },
        branch: {
            type: String,
            required: [true, 'Please provide branch name.'],
            trim: true,
        },
        accountNumber: {
            type: String,
            required: [true, 'Please provide account number.'],
            unique: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
)

// Pre-save hook to check if the vendor exists before saving
vendorBankSchema.pre('save', async function (next) {
    await checkReferenceId(Vendor, this.vendor, next)

    next()
})

// Export the model
const VendorBank = sellerDbConnection.model('VendorBank', vendorBankSchema)

export default VendorBank
