import mongoose from 'mongoose'
import { adminDbConnection } from '../../../config/dbConnections.js'
import validator from 'validator'

const businessGeneralSchema = new mongoose.Schema(
    {
        // Company Information
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide your email address.'],
            unique: true,
            lowercase: true,
            validate: [
                validator.isEmail,
                'Please provide a valid email address.',
            ],
            trim: true,
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            trim: true,
        },
        timezone: {
            type: String,
            required: [true, 'Timezone is required'],
        },
        language: {
            type: String,
            required: [true, 'Language is required'],
            trim: true,
        },
        companyAddress: {
            type: String,
            required: [true, 'Company address is required'],
            trim: true,
        },
        latitude: {
            type: Number,
        },
        longitude: {
            type: Number,
        },

        // Business Information
        // currency: {
        //     type: String,
        //     required: [true, 'Currency is required'],
        //     trim: true,
        //     default: 'PKR',
        // },
        currencyPosition: {
            type: String,
            enum: ['Left', 'Right'],
            required: [true, 'Currency position is required'],
        },
        forgotPasswordVerification: {
            type: String,
            enum: ['Email', 'OTP'],
            defult: 'mail',
            required: [true, 'Forgot password verification method is required'],
        },
        businessModel: {
            type: String,
            enum: ['Single Vendor', 'Multi Vendor'],
            required: [true, 'Business model is required'],
        },
        pagination: {
            type: Boolean,
            default: false,
        },
        companyCopyrightText: {
            type: String,
            required: [true, 'Company copyright text is required'],
            trim: true,
        },

        // App Download Information
        appleStoreLink: {
            type: String,
            required: [true, 'Apple Store download link is required'],
            trim: true,
        },
        googlePlayStoreLink: {
            type: String,
            required: [true, 'Google Play Store download link is required'],
            trim: true,
        },

        // Website Colors
        primaryColor: {
            type: String,
            required: [true, 'Primary color is required'],
            trim: true,
        },
        secondaryColor: {
            type: String,
            required: [true, 'Secondary color is required'],
            trim: true,
        },

        // Website Logos and Assets
        headerLogo: {
            type: String,
            required: [true, 'Header logo is required'],
            trim: true,
        },
        footerLogo: {
            type: String,
            required: [true, 'Footer logo is required'],
            trim: true,
        },
        favicon: {
            type: String,
            required: [true, 'Favicon is required'],
            trim: true,
        },
        loadingGif: {
            type: String,
            required: [true, 'Loading GIF is required'],
            trim: true,
        },
        appLogo: {
            type: String,
            required: [true, 'App logo is required'],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
)

// Export the model
const BusinessGeneral = adminDbConnection.model(
    'BusinessGeneral',
    businessGeneralSchema
)

export default BusinessGeneral
