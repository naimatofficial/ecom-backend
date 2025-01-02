import speakeasy from 'speakeasy'
import twilio from 'twilio'
import crypto from 'crypto'

import catchAsync from '../utils/catchAsync.js'
import OTP from '../models/users/otpModel.js'
import keys from '../config/keys.js'
import AppError from '../utils/appError.js'
// import { emailTransporter } from '../utils/helpers.js'
import sendEmail from './emailService.js'
import axios from 'axios'

// keysure Twilio
// const client = twilio(keys.twilioAccountSID, keys.twilioAuthToken)
const client = []

// Generate OTP and its hash
export const generateOTP = () => {
    const token = speakeasy.totp({
        secret: keys.otpSecretKey,
        encoding: 'base32',
    })
    const hash = crypto.createHash('sha256').update(token).digest('hex')
    return { token, hash }
}

export const otpEmailSend = catchAsync(async (email, otp) => {
    const mailOptions = {
        email: email,
        subject: 'Your Vistamar OTP Code',
        html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP Code</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9fafb;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background-color: #1D6713;
            color: #ffffff;
            padding: 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 20px;
            text-align: center;
          }
          .content p {
            font-size: 16px;
            margin: 0 0 10px;
            color: #4b5563;
          }
          .otp {
            display: inline-block;
            font-size: 24px;
            color: #25851B;
            letter-spacing: 4px;
            font-weight: bold;
            padding: 10px 20px;
            background-color: #f3f4f6;
            border-radius: 6px;
            margin-top: 10px;
          }
          .footer {
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
          }
          .footer a {
            color: #1D6713;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Vista Mart OTP Verification</h1>
          </div>
          <div class="content">
            <p>Dear Customer,</p>
            <p>Your One-Time Password (OTP) for Vista Mart is:</p>
            <div class="otp">${otp}</div>
            <p>This code is valid for the next <strong>2 minutes</strong>. Please do not share it with anyone.</p>
            <p>Thank you for choosing Vista Mart!</p>
          </div>
          <div class="footer">
            <p>Best Regards,</p>
            <p>Vista Mart Team</p>
            <p>
              <a href="https://vistamart.com" target="_blank">Visit Vistamart</a> |
              <a href="mailto:support@vistamart.com">Contact Support</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    }

    await sendEmail(mailOptions)
})

// Send OTP via SMS
export const sendSMS = catchAsync(async (phone, otp) => {
    return client.messages.create({
        messagingServiceSid: keys.twilioAccountSID,
        to: phone,
        body: `Dear Customer, your OTP code for Vistamart is: ${otp}. It is valid for 5 minutes.`,
    })
})

export const otpSMSSend = catchAsync(async (phone, otp) => {
    // Normalize phone number to remove leading "+" if it exists
    if (phone.startsWith('+92')) {
        phone = phone.replace('+92', '92')
    }
    const payload = {
        api_token: keys.lifetimeSMSToken,
        api_secret: keys.lifetimeSMSSecret,
        to: phone,
        from: '8485',
        event_id: '458',
        data: JSON.stringify({ code: otp }),
    }

    try {
        const response = await axios.post('https://lifetimesms.com/otp', null, {
            params: payload,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })

        if (response.data?.messages?.[0]?.status !== 1) {
            throw new AppError(
                `SMS API error: ${
                    response.data.messages[0]?.error || 'Unknown error'
                }`,
                500
            )
        }

        return response.data
    } catch (error) {
        console.error(
            'OTP Sending Error:',
            error.response?.data || error.message
        )
        throw new AppError(error.message || 'Error sending OTP via SMS.', 500)
    }
})

// Save OTP to the database
export const saveOTP = catchAsync(async (email, phone, hash) => {
    const otpEntry = new OTP({ email, phone, hash, createdAt: Date.now() })
    const doc = await otpEntry.save()

    if (!doc) {
        throw new AppError(`OTP could not be created`, 400)
    }
})

// Verify OTP
export const validateOTP = async (token, otpHash) => {
    const hash = crypto.createHash('sha256').update(token).digest('hex')
    return hash === otpHash // Returns true if the OTP hash matches, false otherwise
}
