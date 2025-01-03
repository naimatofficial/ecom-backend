import mongoose from 'mongoose'
import { DbConnection } from '../../config/dbConnections.js'

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    modules: [
        {
            type: String,
            required: true,
        },
    ],
})

const Role = DbConnection.model('Role', roleSchema)

export default Role
