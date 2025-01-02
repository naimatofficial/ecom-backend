import SellerWallet from '../../models/transactions/sellerWalletModel.js'
import Order from '../../models/transactions/orderModel.js'
import catchAsync from '../../utils/catchAsync.js'
import AppError from '../../utils/appError.js'
import Vendor from '../../models/sellers/vendorModel.js'
import { deleteKeysByPattern } from '../../services/redisService.js'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from '../../factory/handleFactory.js'
import { getCacheKey } from '../../utils/helpers.js'
import redisClient from '../../config/redisConfig.js'

export const createSellerWallet = createOne(SellerWallet)

export const updateSellerWallet = async (order, seller, commission) => {
    try {
        const totalAmount = Number(order.totalAmount) || 0
        const totalTaxAmount = Number(order.totalTaxAmount) || 0
        const shippingCost = Number(order.totalShippingCost) || 0
        const commissionAmount = Number(commission) || 0

        const withdrawableBalance =
            totalAmount - commissionAmount - totalTaxAmount - shippingCost

        // Incremental update to existing wallet
        const updatedWallet = await SellerWallet.findOneAndUpdate(
            { vendor: seller._id },
            {
                $inc: {
                    totalCommissionGiven: commissionAmount || 0,
                    totalTaxGiven: totalTaxAmount || 0,
                    withdrawableBalance: withdrawableBalance || 0,
                    totalDeliveryChargeGiven: shippingCost || 0,
                },
            },
            {
                new: true,
                runValidators: true,
                upsert: true, // Create a new wallet if it doesn't exist
            }
        )

        if (!updatedWallet) {
            return `Failed to create or update Seller Wallet.`
        }

        // Clear cache if caching is implemented
        await deleteKeysByPattern('SellerWallet')

        return {
            success: true,
            message: 'Seller wallet updated successfully.',
            wallet: updatedWallet,
        }
    } catch (error) {
        console.error('Error updating Seller Wallet:', error.message)
        return {
            success: false,
            message: `Failed to update Seller Wallet: ${error.message}`,
        }
    }
}

// Controller to calculate and update seller wallet
export const calculateSellerWallet = catchAsync(async (req, res, next) => {
    const { sellerId } = req.body // Change to req.query since it's a GET request

    // Check if the seller exists
    const vendor = await Vendor.findById(sellerId)
    if (!vendor) {
        return next(new AppError('Referenced vendor does not exist', 400))
    }

    // Initialize variables to store calculated values
    let withdrawableBalance = 0
    let pendingWithdraw = 0
    let alreadyWithdrawn = 0
    let totalCommissionGiven = 0
    let totalTaxGiven = 0
    let totalDeliveryChargeEarned = 0
    let collectedCash = 0

    // Calculate Withdrawable Balance
    const completedOrders = await Order.find({
        vendorId: sellerId,
        orderStatus: 'delivered',
    })
    completedOrders.forEach((order) => {
        withdrawableBalance += order.totalAmount
    })

    // Calculate Pending Withdraw
    const pendingWithdrawalOrders = await Order.find({
        vendorId: sellerId,
        paymentStatus: 'pending',
    })
    pendingWithdrawalOrders.forEach((order) => {
        pendingWithdraw += order.totalAmount
    })

    // Calculate Total Commission Given
    const vendorOrders = await Order.find({ vendorId: sellerId })
    vendorOrders.forEach((order) => {
        totalCommissionGiven += order.commission
    })

    // Calculate Total Tax Given
    vendorOrders.forEach((order) => {
        totalTaxGiven += order.taxAmount
    })

    // Calculate Total Delivery Charge Earned
    vendorOrders.forEach((order) => {
        totalDeliveryChargeEarned += order.deliveryCharge
    })

    // Calculate Collected Cash (if applicable)
    const collectedOrders = await Order.find({
        vendorId: sellerId,
        cashCollected: true,
    })
    collectedOrders.forEach((order) => {
        collectedCash += order.totalAmount
    })

    // Update or Create Seller Wallet
    let sellerWallet = await SellerWallet.findOne({ sellerId })
    if (!sellerWallet) {
        sellerWallet = await SellerWallet.create({
            sellerId,
            withdrawableBalance: withdrawableBalance.toFixed(2),
            pendingWithdraw: pendingWithdraw.toFixed(2),
            alreadyWithdrawn: alreadyWithdrawn.toFixed(2),
            totalCommissionGiven: totalCommissionGiven.toFixed(2),
            totalTaxGiven: totalTaxGiven.toFixed(2),
            totalDeliveryChargeEarned: totalDeliveryChargeEarned.toFixed(2),
            collectedCash: collectedCash.toFixed(2),
        })
    } else {
        sellerWallet.withdrawableBalance = withdrawableBalance.toFixed(2)
        sellerWallet.pendingWithdraw = pendingWithdraw.toFixed(2)
        sellerWallet.alreadyWithdrawn = alreadyWithdrawn.toFixed(2)
        sellerWallet.totalCommissionGiven = totalCommissionGiven.toFixed(2)
        sellerWallet.totalTaxGiven = totalTaxGiven.toFixed(2)
        sellerWallet.totalDeliveryChargeEarned =
            totalDeliveryChargeEarned.toFixed(2)
        sellerWallet.collectedCash = collectedCash.toFixed(2)
        await sellerWallet.save()
    }

    // Send the response with updated wallet data
    res.status(200).json({
        status: 'success',
        doc: sellerWallet,
    })
})

// Function to get a seller wallet by seller ID
export const getSellerWallets = getAll(SellerWallet)
export const getSellerWalletById = getOne(SellerWallet)

export const getSellerWalletByVendorId = catchAsync(async (req, res, next) => {
    const { vendorId } = req.params
    const cacheKey = getCacheKey('SellerWallet', vendorId)

    // Check cache first
    const cachedDoc = await redisClient.get(cacheKey)

    if (cachedDoc) {
        return res.status(200).json({
            status: 'success',
            cached: true,
            doc: JSON.parse(cachedDoc),
        })
    }

    const doc = await SellerWallet.findOne({ vendor: vendorId })

    if (!doc) {
        return next(new AppError(`No Seller wallet found with that ID`, 404))
    }

    // Cache the result
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(doc))

    res.status(200).json({
        status: 'success',
        message: 'Seller wallet details',
        cached: false,
        doc,
    })
})

export const updateSellerWalletById = updateOne(SellerWallet)
export const deleteSellerWalletById = deleteOne(SellerWallet)
