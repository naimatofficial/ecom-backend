import catchAsync from '../utils/catchAsync.js'
import sendEmail from './emailService.js'

export const sendVendorApprovedEmail = catchAsync(async (email, vendor) => {
    const mailOptions = {
        email,
        subject: '🎉 Congratulations! Your Shop Has Been Approved',
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vendor Approval</title>
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
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
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
                    font-size: 28px;
                }
                .content {
                    padding: 20px;
                    text-align: center;
                }
                .content p {
                    font-size: 16px;
                    color: #4b5563;
                    line-height: 1.6;
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
                }
                .cta:hover {
                    background-color: #14520D;
                    text-decoration: none;
                }
                .footer {
                    padding: 20px;
                    font-size: 14px;
                    color: #6b7280;
                    text-align: center;
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
                    <h1>🎉 Your Shop is Approved!</h1>
                </div>
                <div class="content">
                    <p>Dear ${vendor.firstName},</p>
                    <p>Congratulations! We are delighted to inform you that your shop is now live on Vista Mart.</p>
                    <p>Start showcasing your products and reach thousands of customers waiting to shop with you.</p>
                    <a href="https://seller.vistamart.biz" target="_blank" class="cta">Access Your Dashboard</a>
                    <p>Thank you for choosing Vista Mart. We are excited to partner with you and help grow your business!</p>
                </div>
                <div class="footer">
                    <p>Best Regards,</p>
                    <p>Vista Mart Team</p>
                    <p>
                        <a href="https://vistamart.biz" target="_blank">Visit Vista Mart</a> |
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
