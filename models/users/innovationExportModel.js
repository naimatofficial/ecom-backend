import mongoose from 'mongoose'
import validator from 'validator'

import { DbConnection } from '../../config/dbConnections.js'

const sectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Section title is required.'],
        trim: true,
        minlength: [3, 'Section title must be at least 3 characters long.'],
        maxlength: [100, 'Section title cannot exceed 100 characters.'],
    },
    data: [
        {
            question: {
                type: String,
                required: [true, 'Question is required.'],
                trim: true,
                minlength: [3, 'Question must be at least 3 characters long.'],
                maxlength: [200, 'Question cannot exceed 200 characters.'],
            },
            answer: {
                type: String,
                required: [true, 'Answer is required.'],
                trim: true,
                minlength: [1, 'Answer must be at least 1 character long.'],
                maxlength: [500, 'Answer cannot exceed 500 characters.'],
            },
        },
    ],
})

const innovationExportSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required.'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters long.'],
            maxlength: [100, 'Name cannot exceed 100 characters.'],
        },
        role: {
            type: String,
            required: [true, 'Role is required.'],
            trim: true,
        },
        organization: {
            type: String,
            required: [true, 'Organization/Department is required.'],
            trim: true,
            maxlength: [100, 'Organization cannot exceed 100 characters.'],
        },
        email: {
            type: String,
            required: [true, 'Email is required.'],
            trim: true,
            unique: true,
            validate: [
                validator.isEmail,
                'Please provide a valid email address.',
            ],
        },
        phoneNumber: {
            type: String,
            required: [true, 'Phone number is required.'],
        },
        suggestions: {
            type: String,
            // reach text
        },
        sections: [sectionSchema],
    },
    { timestamps: true }
)

const InnovationExport = DbConnection.model(
    'InnovationExport',
    innovationExportSchema
)

export default InnovationExport
