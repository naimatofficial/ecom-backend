import {
    createOne,
    getAll,
    getOne,
    updateOne,
    deleteOne,
} from '../../factory/handleFactory.js'
import Transaction from '../../models/transactions/transactionModel.js'
import catchAsync from '../../utils/catchAsync.js'

// Create Transaction
export const createTransaction = catchAsync(async (order, seller, customer) => {
    const transaction = {
        paymentRefNo: order.paymentRefNo || '',
        orderId: order.orderId,
        shopName: seller.shopName,
        customerName: customer.firstName,
        totalProductAmount: order.totalAmount,
        couponDiscount: 0,
        discountedAmount: order.totalDiscount,
        shippingCharge: order.totalShippingCost,
        orderAmount: order.totalAmount,
        vatOrTax: order.totalTaxAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus === 'Paid' ? 'Completed' : 'Pending',
    }

    await Transaction.create(transaction)
})

// Get All Transactions
export const getTransactions = getAll(Transaction)

// Get Transaction by ID
export const getTransactionById = getOne(Transaction)

// Update Transaction
export const updateTransaction = updateOne(Transaction)

// Delete Transaction
export const deleteTransaction = deleteOne(Transaction)
