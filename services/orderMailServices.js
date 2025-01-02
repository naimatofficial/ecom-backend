import catchAsync from '../utils/catchAsync.js'
import sendEmail from './emailService.js'

export const sendOrderEmailToCustomer = catchAsync(
    async (customer, orderId) => {
        const mailOptions = {
            email: customer.email,
            subject: 'Your Order Has Been Placed',
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Your Order Confirmation</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f3f4f6;
                        color: #333;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
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
                    .order-id {
                        font-weight: bold;
                        color: #1D6713;
                    }
                    .cta {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 12px 24px;
                        font-size: 16px;
                        font-weight: bold;
                        color: #ffffff !important;
                        background-color: #1D6713;
                        border-radius: 6px;
                        text-decoration: none;
                        text-align: center;
                    }
                    .cta:hover {
                        background-color: #14520D;
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
                    .footer a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Order Placed</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${customer.firstName},</p>
                        <p>Thank you for your order! Your order ID is <span class="order-id">${orderId}</span>.</p>
                        <p>We’ll keep you updated on the status of your order soon.</p>
                        <p>Thank you for choosing Vista Mart. We appreciate your business!</p>
                    </div>
                    <div class="footer">
                        <p>If you have any questions, feel free to <a href="mailto:support@vistamart.biz">contact us</a>.</p>
                        <p>Best Regards,</p>
                        <p>Vista Mart Team</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        }
        await sendEmail(mailOptions)
    }
)

export const sendOrderEmailToVendor = catchAsync(
    async (vendor, customer, orderId) => {
        const mailOptions = {
            email: vendor.email,
            subject: `New Order Received - `,
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Order Confirmation</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f3f4f6;
                        color: #333;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .header {
                        background-color: #25851B;
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
                    }
                    .order-id {
                        font-weight: bold;
                        color: #25851B;
                    }
                    .cta {
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
                    .cta:hover {
                        background-color: #1b5e13;
                    }
                    .footer {
                        padding: 20px;
                        text-align: center;
                        font-size: 14px;
                        color: #6b7280;
                    }
                    .footer a {
                        color: #25851B;
                        text-decoration: none;
                    }
                    .footer a:hover {
                        text-decoration: underline;
                    }
                    .action {
                        text-align: center;
                        padding: 20px; 
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Your New Order Received</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${vendor.firstName},</p>
                        <p>You have received a new order from <strong>${customer.firstName}</strong>.</p>
                        <p>Order ID: <span class="order-id">${orderId}</span></p>
                        <div class="action">
                            <a href="https://seller.vistamart.biz/pendingorders" class="cta">Go to Orders</a>
                        </div>
                        <p>Thank you for your attention!</p>
                    </div>
                    <div class="footer">
                        <p>If you have any questions, feel free to <a href="mailto:support@vistamart.biz">contact us</a>.</p>
                        <p>Best Regards,</p>
                        <p>Vista Mart Team</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        }

        await sendEmail(mailOptions)
    }
)
