import {
    checkFields,
    deleteOne,
    getAll,
    getOne,
    updateStatus,
} from '../../factory/handleFactory.js'
import Vendor from '../../models/sellers/vendorModel.js'
import AdminWallet from '../../models/transactions/adminWalletModel.js'
import SellerWallet from '../../models/transactions/sellerWalletModel.js'
import Withdraw from '../../models/transactions/withdrawModel.js'
import { deleteKeysByPattern } from '../../services/redisService.js'
import AppError from '../../utils/appError.js'
import catchAsync from '../../utils/catchAsync.js'

export const createWithdrawRequest = catchAsync(async (req, res, next) => {
    const { amount, requestedBy } = req.body

    // Validation for minimum withdrawal amount
    if (amount < 500) {
        return next(
            new AppError('Withdrawal amount must be greater than 500.', 400)
        )
    }

    // Fetch seller wallet to validate balance
    const sellerWallet = await SellerWallet.findOne({ vendor: requestedBy })

    if (!sellerWallet) {
        return next(new AppError(`Seller wallet not found`, 404))
    }

    const { withdrawableBalance } = sellerWallet

    // Ensure withdrawable balance is sufficient
    if (amount > withdrawableBalance) {
        return next(
            new AppError(
                `Insufficient balance. Available withdrawable balance is ${withdrawableBalance}.`,
                400
            )
        )
    }

    // Filter and sanitize the input
    const { filteredData } = checkFields(Withdraw, req, next)

    // Create the withdrawal request
    const doc = await Withdraw.create(filteredData)

    if (!doc) {
        return next(
            new AppError(
                'Withdraw request could not be created. Please try again later.',
                500
            )
        )
    }

    // Update seller wallet atomically
    const updatedSellerWallet = await SellerWallet.findOneAndUpdate(
        { vendor: requestedBy },
        {
            $inc: {
                withdrawableBalance: -amount,
                pendingWithdraw: amount,
            },
        },
        { new: true, runValidators: true }
    )

    if (!updatedSellerWallet) {
        return next(new AppError(`Seller wallet not updated`, 500))
    }

    // Clear relevant cache
    await Promise.all([
        deleteKeysByPattern('Withdraw'),
        deleteKeysByPattern('SellerWallet'),
    ])

    // Send response
    res.status(201).json({
        status: 'success',
        message: 'Withdraw request created successfully.',
        doc: {
            withdrawalRequest: doc,
            updatedWallet: updatedSellerWallet,
        },
    })
})

// Get all vendors
export const getAllWithdraws = getAll(Withdraw)

// Get vendor by ID
export const getWithdrawById = getOne(Withdraw)

// Delete vendor by ID
export const deleteWithdraw = deleteOne(Withdraw)

// export const updateWithdrawRequestStatus = catchAsync(
//     async (req, res, next) => {
//         const { status, note, image, vendorId } = req.body

//         // Validate incoming request data
//         if (!status || !vendorId) {
//             return next(new AppError(`Status and Vendor ID are required`, 400))
//         }

//         // Update withdraw request
//         const withdraw = await Withdraw.findOneAndUpdate(
//             { requestedBy: vendorId },
//             { status, note, image },
//             { new: true, runValidators: true }
//         )

//         if (!withdraw) {
//             return next(new AppError(`No withdraw found with that ID`, 404))
//         }

//         // If approved, adjust wallet balances
//         if (status === 'Approved') {
//             const { amount } = withdraw

//             if (!amount || amount <= 0) {
//                 return next(new AppError(`Invalid withdraw amount`, 400))
//             }

//             const adminWallet = await AdminWallet.findOneAndUpdate(
//                 { vendor: vendorId },
//                 { $inc: { pendingAmount: -amount } },
//                 { new: true, runValidators: true }
//             )

//             if (!adminWallet) {
//                 return next(new AppError(`Admin wallet not updated`, 404))
//             }

//             const sellerWallet = await SellerWallet.findOneAndUpdate(
//                 { vendor: vendorId },
//                 {
//                     $inc: {
//                         alreadyWithdrawn: amount,
//                         pendingWithdraw: -amount,
//                     },
//                 },
//                 { new: true, runValidators: true }
//             )

//             if (!sellerWallet) {
//                 return next(new AppError(`Seller wallet not updated`, 404))
//             }
//         } else if (status === 'Rejected') {
//             const sellerWallet = await SellerWallet.findOneAndUpdate(
//                 { vendor: vendorId },
//                 {
//                     $inc: {
//                         withdrawableBalance: amount,
//                         pendingWithdraw: -amount,
//                     },
//                 },
//                 { new: true, runValidators: true }
//             )

//             if (!sellerWallet) {
//                 return next(new AppError(`Seller wallet not updated`, 404))
//             }
//         }

//         // Clear caches efficiently
//         await Promise.all([
//             deleteKeysByPattern('Withdraw'),
//             deleteKeysByPattern('SellerWallet'),
//             deleteKeysByPattern('AdminWallet'),
//         ])

//         // Send response
//         res.status(200).json({
//             status: 'success',
//             doc: withdraw,
//         })
//     }
// )

export const updateWithdrawRequestStatus = catchAsync(
    async (req, res, next) => {
        const withdrawId = req.params.id

        const { status, note, transactionReceiptImage } = req.body

        // Validate request data
        if (!status) {
            return next(new AppError(`Status are required.`, 400))
        }

        // Find and validate the withdraw request
        const withdraw = await Withdraw.findById(withdrawId)

        if (!withdraw) {
            return next(
                new AppError(
                    `No withdraw request found for the given Vendor ID.`,
                    404
                )
            )
        }

        // Prevent status update for already approved requests
        if (withdraw.status === 'Approved') {
            return next(
                new AppError(
                    `Withdraw request has already been approved and cannot be updated further.`,
                    400
                )
            )
        }

        if (withdraw.status === 'Rejected') {
            return next(
                new AppError(
                    `Withdraw request has already been rejected. Please request antoher withdraw.`,
                    400
                )
            )
        }

        const { amount } = withdraw

        // Ensure a valid withdraw amount
        if (!amount || amount <= 0) {
            return next(new AppError(`Invalid withdraw amount.`, 400))
        }

        // Update withdraw request with new status
        withdraw.status = status
        withdraw.note = note || withdraw.note
        withdraw.transactionReceiptImage =
            transactionReceiptImage || withdraw.transactonReceiptImage
        await withdraw.save()

        if (status === 'Approved') {
            // Deduct from admin wallet
            const adminWallet = await AdminWallet.findOneAndUpdate(
                { vendor: withdraw.requestedBy },
                { $inc: { pendingAmount: -amount } },
                { new: true, runValidators: true }
            )

            if (!adminWallet) {
                return next(
                    new AppError(`Admin wallet could not be updated.`, 404)
                )
            }

            // Update seller wallet
            const sellerWallet = await SellerWallet.findOneAndUpdate(
                { vendor: withdraw.requestedBy },
                {
                    $inc: {
                        alreadyWithdrawn: amount,
                        pendingWithdraw: -amount,
                    },
                },
                { new: true, runValidators: true }
            )

            if (!sellerWallet) {
                return next(
                    new AppError(`Seller wallet could not be updated.`, 404)
                )
            }
        } else if (status === 'Rejected') {
            // Refund to seller wallet
            const sellerWallet = await SellerWallet.findOneAndUpdate(
                { vendor: withdraw.requestedBy },
                {
                    $inc: {
                        withdrawableBalance: amount,
                        pendingWithdraw: -amount,
                    },
                },
                { new: true, runValidators: true }
            )

            if (!sellerWallet) {
                return next(
                    new AppError(`Seller wallet could not be updated.`, 404)
                )
            }
        }

        // Clear relevant caches in parallel
        await Promise.all([
            deleteKeysByPattern('Withdraw'),
            deleteKeysByPattern('SellerWallet'),
            deleteKeysByPattern('AdminWallet'),
        ])

        // Send response
        res.status(200).json({
            status: 'success',
            message: 'Withdraw request updated successfully.',
            doc: withdraw,
        })
    }
)

export const updateWithdrawStatus = updateStatus(Withdraw)
