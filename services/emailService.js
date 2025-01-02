import keys from '../config/keys.js'
import catchAsync from '../utils/catchAsync.js'
import { emailTransporter } from '../utils/helpers.js'

// const sendEmail = catchAsync(async (options) => {
//     // Define the email options
//     const mailOptions = {
//         from: keys.emailAddress,
//         to: options.email,
//         subject: options.subject,
//         html: options.html,
//     }

//     // Actually send the email
//     await emailTransporter.sendMail(mailOptions, function (error, info) {
//         if (error) {
//             console.log(`Error:`, error)
//         } else {
//             console.log('Email sent: ' + info.response)
//         }
//     })
// })

const sendEmail = catchAsync(async (options) => {
    // Define the email options
    const mailOptions = {
        from: `Vista Mart <${keys.emailAddress}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    }

    // Actually send the email
    await emailTransporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(`Error:`, error)
        } else {
            console.log('Email sent: ' + info.response)
        }
    })
})

export default sendEmail
