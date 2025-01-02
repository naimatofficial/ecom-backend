import Order from '../../models/transactions/orderModel.js'
import catchAsync from '../../utils/catchAsync.js'
import Product from '../../models/admin/business/productBusinessModel.js'
import Customer from '../../models/users/customerModel.js'
import Vendor from '../../models/sellers/vendorModel.js'
import AdminWallet from '../../models/transactions/adminWalletModel.js'
import { deleteKeysByPattern } from '../../services/redisService.js'
import {
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from '../../factory/handleFactory.js'

// Get Business Analytics
export const getBusinessAnalytics = catchAsync(async (req, res, next) => {
    //Get total orders count
    const totalOrders = await Order.countDocuments()

    // Get total products count
    const totalProducts = await Product.countDocuments()

    // Get total customers count
    const totalCustomers = await Customer.countDocuments()

    // Get total stores (vendors) count
    const totalStores = await Vendor.countDocuments()

    //Get Order Status count
    const pendingOrder = await Order.countDocuments({})

    // Get order statuses count
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' })
    const confirmedOrders = await Order.countDocuments({
        orderStatus: 'confirmed',
    })
    const packagingOrders = await Order.countDocuments({
        orderStatus: 'packaging',
    })
    const outForDeliveryOrders = await Order.countDocuments({
        orderStatus: 'out_for_delivery',
    })
    const deliveredOrders = await Order.countDocuments({
        orderStatus: 'delivered',
    })
    const failedToDeliverOrders = await Order.countDocuments({
        orderStatus: 'failed_to_deliver',
    })
    const returnedOrders = await Order.countDocuments({
        orderStatus: 'returned',
    })
    const canceledOrders = await Order.countDocuments({
        orderStatus: 'canceled',
    })

    // Send the response
    res.status(200).json({
        status: 'success',
        doc: {
            totalOrders,
            totalProducts,
            totalCustomers,
            totalStores,
            ordersByStatus: {
                pending: pendingOrders,
                confirmed: confirmedOrders,
                packaging: packagingOrders,
                out_for_delivery: outForDeliveryOrders,
                delivered: deliveredOrders,
                failed_to_deliver: failedToDeliverOrders,
                returned: returnedOrders,
                canceled: canceledOrders,
            },
        },
    })
})

export const createAdminWallet = async (order, seller, commission) => {
    try {
        const totalAmount = Number(order.totalAmount) || 0
        const totalTaxAmount = Number(order.totalTaxAmount) || 0
        const shippingCost = Number(order.totalShippingCost) || 0
        const commissionAmount = Number(commission) || 0

        const pendingAmount =
            totalAmount - commissionAmount - totalTaxAmount - shippingCost

        const newWallet = {
            vendor: seller._id,
            pendingAmount,
            commissionEarned: commissionAmount,
            totalTaxCollected: totalTaxAmount,
            InhouseEarning: seller.role === 'in-house' ? totalAmount : 0,
            deliveryChargeGiven: seller.role === 'in-house' ? shippingCost : 0,
        }

        // Find the latest Admin Wallet and update commission atomically
        const updatedWallet = await AdminWallet.create(newWallet)

        // Handle case where no document exists
        if (!updatedWallet) {
            return `Admin Wallet is not created.`
        }

        // Clear cache related to AdminWallet
        await deleteKeysByPattern('AdminWallet')

        return true // Return success
    } catch (error) {
        console.error('Error updating Admin Wallet commission:', error.message)
        return `Failed to update Admin Wallet: ${error.message}`
    }
}

export const getAdminWallets = getAll(AdminWallet)
export const getAdminWalletById = getOne(AdminWallet)

export const updateAdminWalletById = updateOne(AdminWallet)
export const deleteAdminWalletById = deleteOne(AdminWallet)

export const calculateAdminWallet = catchAsync(async (req, res, next) => {
    const aggregatedData = await AdminWallet.aggregate([
        {
            $group: {
                _id: null,
                totalInhouseEarning: { $sum: { $toDouble: '$InhouseEarning' } },
                totalCommissionEarned: {
                    $sum: { $toDouble: '$commissionEarned' },
                },
                totalDeliveryChargeEarned: {
                    $sum: { $toDouble: '$deliveryChargeEarned' },
                },
                totalTaxCollected: {
                    $sum: { $toDouble: '$totalTaxCollected' },
                },
                totalPendingAmount: { $sum: { $toDouble: '$pendingAmount' } },
            },
        },
        { $project: { _id: 0 } }, // Exclude the _id field from the response
    ])

    const response = aggregatedData[0] || {
        totalInhouseEarning: 0,
        totalCommissionEarned: 0,
        totalDeliveryChargeEarned: 0,
        totalTaxCollected: 0,
        totalPendingAmount: 0,
    }

    res.status(200).json({
        status: 'success',
        totals: response,
    })
})
