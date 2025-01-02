import rateLimit from 'express-rate-limit'
import AppError from './appError.js'
import keys from '../config/keys.js'
import nodemailer from 'nodemailer'

// Helper function to get the cache key
export const getCacheKey = (modelName, id = '', query = {}) => {
    const baseKey = `cache:${modelName}`
    if (id) return `${baseKey}:${id}`
    return `${baseKey}:query:${JSON.stringify(query)}`
}

// export const emailTransporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: keys.emailAddress,
//         pass: keys.emailPassKey,
//     },
// })

export const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // Use SSL/TLS
    auth: {
        user: process.env.EMAIL_ADDRESS, // Your email
        pass: process.env.EMAIL_PASSWORD, // Your email password
    },
})

export const checkReferenceId = async (Model, foreignKey, next) => {
    const referenceKey = await Model.findById(foreignKey)

    console.log({ foreignKey, referenceKey })

    if (!referenceKey) {
        const docName = Model?.modelName?.toLowerCase() || 'Document'

        return next(
            new AppError(`Referenced ${docName} ID does not exist`, 400)
        )
    }
}

export const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 50, // limit each IP to 5 requests per windowMs
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json({
            status: 'fail',
            message: `Too many login attempts from this IP, please try again after ${Math.ceil(
                options.windowMs / 1000 / 60
            )} minutes.`,
        })
    },
    standardHeaders: true, // Send rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

export const createPasswordResetMessage = (
    email,
    ipAddress,
    timestamp,
    resetUrl
) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
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
          }
          .content p {
            font-size: 16px;
            margin: 0 0 10px;
            color: #4b5563;
          }
          .reset-link {
            display: inline-block;
            font-size: 16px;
            color: #ffffff !important;
            background-color: #25851B;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 10px;
            font-weight: bold;
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

          .button-reset {
            text-align: center;
            margin-bottom: 24px; 
           }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Dear Customer,</p>
            <p>A password reset request was initiated for your account. To reset your password, please click the button below:</p>
            <div class='button-reset'>
                <a href="${resetUrl}" class="reset-link">Reset Password</a>
            </div>
            <p>If you did not make this request, you can safely ignore this email. Your password will remain unchanged.</p>
            <hr>
            <p>Details of the request:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>IP Address:</strong> ${ipAddress}</p>
            <p><strong>Timestamp:</strong> ${timestamp}</p>
          </div>
          <div class="footer">
            <p>Best Regards,</p>
            <p>Vista Mart Team</p>
            <p>
              <a href="https://vistamart.com" target="_blank">Visit Vista Mart</a> |
              <a href="mailto:support@vistamart.com">Contact Support</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
}

export const createPasswordResetConfirmationMessage = (
    email,
    ipAddress,
    timestamp
) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Confirmation</title>
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
                }
                .content p {
                    font-size: 16px;
                    margin: 0 0 10px;
                    color: #4b5563;
                }
                .table {
                    width: 100%;
                    margin-top: 20px;
                    border-collapse: collapse;
                }
                .table td {
                    padding: 10px;
                    border-bottom: 1px solid #e5e7eb;
                    font-size: 14px;
                    color: #333;
                }
                .table td:first-child {
                    font-weight: bold;
                    color: #1D6713;
                }
                .footer {
                    padding: 20px;
                    text-align: center;
                    font-size: 14px;
                    color: #6b7280;
                    border-top: 1px solid #e5e7eb;
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
                    <h1>Password Reset Confirmation</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Your password has been successfully reset. If you did not initiate this request, please contact us immediately.</p>
                    <table class="table">
                        <tr>
                            <td>Email:</td>
                            <td>${email}</td>
                        </tr>
                        <tr>
                            <td>IP Address:</td>
                            <td>${ipAddress}</td>
                        </tr>
                        <tr>
                            <td>Reset Timestamp:</td>
                            <td>${timestamp}</td>
                        </tr>
                    </table>
                </div>
                <div class="footer">
                    <p>If you have any questions or concerns, feel free to contact us:</p>
                    <p>
                        <a href="mailto:support@visamart.com">support@visamart.com</a> |
                        <a href="https://vistamart.com" target="_blank">Visit Visa Mart</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
    `
}
