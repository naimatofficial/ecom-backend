import mongoose from 'mongoose'
import { adminDbConnection } from '../../config/dbConnections.js'

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

const Role = adminDbConnection.model('Role', roleSchema)

export default Role
