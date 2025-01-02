import mongoose from 'mongoose'
import { adminDbConnection } from '../../config/dbConnections.js'

const attributeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide attribute name.'],
            unique: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
)

// Create the model and associate it with the AdminDB connection
const Attribute = adminDbConnection.model('Attribute', attributeSchema)

export default Attribute
