import { v4 as uuidv4 } from 'uuid'

import catchAsync from '../../utils/catchAsync.js'
import redisClient from '../../config/redisConfig.js'
import { getCacheKey } from '../../utils/helpers.js'
import APIFeatures from '../../utils/apiFeatures.js'

import Product from '../../models/sellers/productModel.js'
import Vendor from '../../models/sellers/vendorModel.js'
import Customer from '../../models/users/customerModel.js'
import Coupon from '../../models/sellers/couponModel.js'
import Order from '../../models/transactions/orderModel.js'
import AppError from '../../utils/appError.js'

import { deleteKeysByPattern } from '../../services/redisService.js'
import { deleteOne, updateOne } from './../../factory/handleFactory.js'
import {
    sendOrderEmailToCustomer,
    sendOrderEmailToVendor,
} from '../../services/orderMailServices.js'
import { createTransaction } from './transactionController.js'
import SellerBusiness from './../../models/admin/business/sellerBusinessModel.js'
import { createAdminWallet } from './adminWalletController.js'
import { updateSellerWallet } from './sellerWalletController.js'
import ShippingInfo from '../../models/sellers/shippingInfoModel.js'
import Category from '../../models/admin/categories/categoryModel.js'

const updateCouponUserLimit = catchAsync(async (_couponId, next) => {
    // Find the coupon by ID
    const coupon = await Coupon.findById(_couponId)

    if (!coupon) {
        return next(new AppError(`No coupon found by that ID.`, 404))
    }

    // Check if the used count has reached or exceeded the limit
    if (coupon.userLimit.used >= coupon.userLimit.limit) {
        return next(new AppError(`Coupon is expired.`, 400))
    }

    // Increment the used field by 1
    coupon.userLimit.used += 1
    await coupon.save({ validateBeforeSave: true })
})

function generateOrderId() {
    // Generate a UUID and take the first 8 characters
    return uuidv4().replace(/-/g, '').substring(0, 8)
}

export const createOrder = catchAsync(async (req, res, next) => {
    const {
        couponId,
        customerId,
        vendor,
        products,
        totalAmount,
        totalDiscount,
        totalQty,
        totalShippingCost,
        totalTaxAmount,
        paymentMethod,
        paymentStatus,
        orderNote,
        paymentRefNo,
    } = req.body

    console.log('order: ', paymentRefNo)

    // Validate essential fields
    if (!customerId || !vendor || !products || products.length === 0) {
        return next(new AppError('Missing required fields.', 400))
    }

    const customer = await Customer.findById(customerId)
    if (!customer) {
        return next(new AppError('Customer details not found.', 404))
    }

    const newOrder = {
        orderId: generateOrderId(),
        coupon: couponId || undefined,
        customer: customerId,
        vendor,
        products,
        totalAmount,
        totalDiscount,
        totalQty,
        totalShippingCost,
        totalTaxAmount,
        paymentMethod,
        shippingAddress: customer.shippingAddress,
        billingAddress: customer.shippingAddress,
        paymentStatus,
        orderNote,
        paymentRefNo,
    }

    // Handle coupon usage (async for scalability)
    if (couponId) {
        updateCouponUserLimit(couponId, next)
    }

    // // Check stock availability for all products (batch process for efficiency)
    // const productIds = products.map((item) => item.product)
    // const productDocs = await Product.find({ _id: { $in: productIds } })
    // const stockIssues = products.filter((item) => {
    //     const product = productDocs.find((doc) => doc._id.equals(item.product))

    //     if (!product || product.stock <= 0 || item.quantity > product.stock) {
    //         return true
    //     }
    //     return false
    // })

    // if (stockIssues.length > 0) {
    //     return next(
    //         new AppError(
    //             `Stock issues with the following products: ${stockIssues
    //                 .map((item) => item.product)
    //                 .join(', ')}`,
    //             400
    //         )
    //     )
    // }

    // Create the order
    const doc = await Order.create(newOrder)
    if (!doc) {
        return next(new AppError('Order could not be created.', 400))
    }

    // Update stock and clear cache for affected products (batch operation)
    const bulkStockUpdate = products.map((item) => ({
        updateOne: {
            filter: { _id: item.product },
            update: { $inc: { stock: -item.quantity } },
        },
    }))

    await Product.bulkWrite(bulkStockUpdate)
    await deleteKeysByPattern('Product')

    // Send order confirmation emails
    const seller = await Vendor.findById(vendor).select(
        'email firstName lastName shopName'
    )

    if (!seller) {
        return next(new AppError('Vendor details not found.', 404))
    }
    // create order transcation
    createTransaction(newOrder, seller, customer)

    // Send notifications
    await Promise.all([
        sendOrderEmailToCustomer(customer, newOrder.orderId),
        sendOrderEmailToVendor(seller, customer, newOrder.orderId),
    ])

    // Clear relevant caches
    await Promise.all([
        deleteKeysByPattern('Order'),
        deleteKeysByPattern('Vendor'),
        deleteKeysByPattern('Transaction'),
    ])

    // Respond with success
    res.status(201).json({
        status: 'success',
        doc,
    })
})

// Get all orders
export const getAllOrders = catchAsync(async (req, res, next) => {
    const cacheKey = getCacheKey('Order', '', req.query)
    const cachedDoc = await redisClient.get(cacheKey)

    if (cachedDoc) {
        return res.status(200).json({
            status: 'success',
            cached: true,
            results: JSON.parse(cachedDoc).length,
            doc: JSON.parse(cachedDoc),
        })
    }

    let query = Order.find().lean()

    const features = new APIFeatures(query, req.query)
        .filter()
        .sort()
        .fieldsLimit()
        .paginate()

    const orders = await features.query

    // Batch fetching all products, vendors, and customers
    const productIds = orders.flatMap((order) =>
        order.products.map((p) => p.product)
    )

    const vendorIds = orders.map((order) => order.vendor)
    const customerIds = orders.map((order) => order.customer)

    const [products, vendors, customers] = await Promise.all([
        Product.find({ _id: { $in: productIds } }).lean(),
        Vendor.find({ _id: { $in: vendorIds } }).lean(),
        Customer.find({ _id: { $in: customerIds } }).lean(),
    ])

    const totalOrders = orders.map((order) => ({
        ...order,
        products: order.products.map((p) => ({
            ...p,
            product: products.find((prod) => prod._id.equals(p.product)),
        })),
        vendor: vendors.find((v) => v._id.equals(order.vendor)),
        customer: customers.find((c) => c._id.equals(order.customer)),
    }))

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(totalOrders))

    res.status(200).json({
        status: 'success',
        cached: false,
        results: totalOrders.length,
        doc: totalOrders,
    })
})

// Delete an order
export const deleteOrder = deleteOne(Order)

export const getOrderById = catchAsync(async (req, res, next) => {
    const { id } = req.params

    const cacheKey = getCacheKey('Order', id)

    // Check cache first
    const cachedDoc = await redisClient.get(cacheKey)

    if (cachedDoc) {
        return res.status(200).json({
            status: 'success',
            cached: true,
            doc: JSON.parse(cachedDoc),
        })
    }

    // Fetch the order from the main database
    const order = await Order.findById(id).lean()
    if (!order) {
        return next(new AppError('No order found with that ID', 404))
    }

    // Fetch related data from other databases
    const productIds = order.products.map((p) => p.product)
    const vendorId = order.vendor
    const customerId = order.customer

    // Fetch data from respective databases (using respective models)
    const products = await Product.find({ _id: { $in: productIds } })
        .select(
            'name price description thumbnail slug userId discountAmount taxIncluded taxAmount weight category'
        )
        .lean()
    const customer = await Customer.findById(customerId)
        .select('firstName lastName email phoneNumber image')
        .lean()

    const detailedProducts = await Promise.all(
        order.products.map(async (p) => {
            let productDetails = products.find(
                (prod) => prod._id.toString() === p.product.toString()
            )

            const categoryDetails = await Category.findById(
                productDetails.category
            )
                .select('name slug shippingCategoryId')
                .lean()

            productDetails = {
                ...productDetails,
                category: categoryDetails,
            }

            return {
                ...p,
                productDetails, // Attach detailed product data here
            }
        })
    )

    const vendor = await Vendor.findById(vendorId).lean()
    const shippingInfo =
        (await ShippingInfo.findOne({ vendorId }).lean()) || null

    // Attach related data to the order object
    const detailedOrder = {
        ...order,
        products: detailedProducts,
        vendor,
        customer,
        shippingInfo,
    }
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(detailedOrder))

    res.status(200).json({
        status: 'success',
        cached: false,
        doc: detailedOrder,
    })
})
export const getOrderStatus = catchAsync(async (req, res, next) => {
    const { orderId } = req.params

    const cacheKey = getCacheKey('Order', orderId)

    // Check cache first
    const cachedDoc = await redisClient.get(cacheKey)

    if (cachedDoc) {
        return res.status(200).json({
            status: 'success',
            cached: true,
            doc: JSON.parse(cachedDoc),
        })
    }

    // Fetch the order from the main database
    const order = await Order.findOne({ orderId }).select('status').lean()

    if (!order) {
        return next(new AppError('No track order found with that ID', 404))
    }

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(order))

    res.status(200).json({
        status: 'success',
        cached: false,
        doc: order,
    })
})

export const getCustomerOrderById = catchAsync(async (req, res, next) => {
    const { id } = req.params

    // Fetch the order by ID
    const order = await Order.findOne({ customer: id }).lean()

    if (!order) {
        return next(new AppError('No order found with that customer ID', 404))
    }

    // Fetch related data from the respective models
    const products = await Product.find({ _id: { $in: order.products } }).lean()
    const vendors = await Vendor.find({ _id: { $in: order.vendor } }).lean()
    const customer = await Customer.findById(id).lean()

    // Map products and vendors by their IDs for efficient lookup
    const productsMap = products.reduce((map, product) => {
        map[product._id] = product
        return map
    }, {})

    const vendorsMap = vendors.reduce((map, vendor) => {
        map[vendor._id] = vendor
        return map
    }, {})

    // Map the products array to their corresponding product documents
    const orderProducts = order.products.map(
        (productId) => productsMap[productId] || null
    )

    // Map the vendors array to their corresponding vendor documents
    const vendor = await Vendor.findById(vendorId).lean()

    // Add full details of customer, products, and vendors to the order
    const customerOrders = {
        ...order, // Spread the existing order fields
        customer, // Add the customer object
        vendor, // Add the full vendor objects
        products: orderProducts, // Add the full product objects
    }

    res.status(200).json({
        status: 'success',
        doc: customerOrders,
    })
})

// Update an order's status
export const updateOrderStatus = catchAsync(async (req, res, next) => {
    const status = req.body.status
    if (!status) {
        return next(new AppError(`Please provide status value.`, 400))
    }

    // Perform the update operation
    const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        {
            new: true,
            runValidators: true,
        }
    )

    // Handle case where the document was not found
    if (!updatedOrder) {
        return next(new AppError(`No Order found with that ID`, 404))
    }

    // If the order status is 'delivered', increment the product sell count
    if (status === 'delivered' && updatedOrder?.products) {
        const vendorId = updatedOrder.vendor
        for (const item of updatedOrder?.products) {
            const { product, quantity } = item

            // Update sold count by the quantity sold and reduce the stock by the same quantity
            await Product.findByIdAndUpdate(
                product,
                {
                    $inc: {
                        sold: quantity, // Increment the sold count by the quantity sold
                        // stock: -quantity, // Decrement the stock by the quantity sold
                    },
                },
                { new: true }
            )

            // Increment order count when creating an order
            await Vendor.findByIdAndUpdate(vendorId, {
                $inc: { totalOrders: 1 },
            })

            await await deleteKeysByPattern('Product')
            await await deleteKeysByPattern('Vendor')
        }

        const [business, seller] = await Promise.all([
            SellerBusiness.findOne()
                .sort({ createdAt: -1 })
                .select('defaultCommission')
                .lean(),
            Vendor.findById(vendorId).select(
                'email firstName lastName shopName'
            ),
        ])

        if (!business || !seller) {
            return next(
                new AppError(
                    'Businness Settings or Vendor details not found.',
                    404
                )
            )
        }

        // Calculate commission and update wallets/transactions
        const commission =
            (updatedOrder.totalAmount * business.defaultCommission) / 100
        await Promise.all([
            createAdminWallet(updatedOrder, seller, commission),
            updateSellerWallet(updatedOrder, seller, commission),
        ])
    }

    await deleteKeysByPattern('Order')

    res.status(200).json({
        status: 'success',
        message: 'Order successfully updated',
        doc: updatedOrder,
    })
})

export const getOrderByCustomer = catchAsync(async (req, res, next) => {
    const customerId = req.params.customerId

    // Check cache first
    const cacheKey = getCacheKey('Order', customerId)
    const cachedDoc = await redisClient.get(cacheKey)

    if (cachedDoc) {
        return res.status(200).json({
            status: 'success',
            cached: true,
            doc: JSON.parse(cachedDoc),
        })
    }

    // If not in cache, fetch from database
    const doc = await Order.findOne({ customer: customerId })

    if (!doc) {
        return next(new AppError(`No Order found with that customer Id`, 404))
    }

    // Cache the result
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(doc))

    res.status(200).json({
        status: 'success',
        cached: false,
        doc,
    })
})

export const getOrderDetailsByOderId = catchAsync(async (req, res, next) => {
    const orderId = req.params.orderId

    // Check cache first
    const cacheKey = getCacheKey('Order', orderId)
    const cachedDoc = await redisClient.get(cacheKey)

    if (cachedDoc) {
        return res.status(200).json({
            status: 'success',
            cached: true,
            message: 'Order details',
            doc: JSON.parse(cachedDoc),
        })
    }

    // If not in cache, fetch from database
    const order = await Order.findOne({ orderId }).lean()

    if (!order) {
        return next(new AppError(`No Order found with that Id`, 404))
    }

    // Fetch related data from other databases
    const productIds = order.products.map((p) => p.product)
    const vendorId = order.vendor
    const customerId = order.customer

    // Fetch data from respective databases (using respective models)
    const products = await Product.find({ _id: { $in: productIds } })
        .select(
            'name price description thumbnail slug userId discountAmount taxIncluded taxAmount weight category'
        )
        .lean()
    const customer = await Customer.findById(customerId)
        .select('firstName lastName email phoneNumber image')
        .lean()

    const detailedProducts = await Promise.all(
        order.products.map(async (p) => {
            let productDetails = products.find(
                (prod) => prod._id.toString() === p.product.toString()
            )

            const categoryDetails = await Category.findById(
                productDetails.category
            )
                .select('name slug shippingCategoryId')
                .lean()

            productDetails = {
                ...productDetails,
                category: categoryDetails,
            }

            return {
                ...p,
                productDetails, // Attach detailed product data here
            }
        })
    )

    const vendor = await Vendor.findById(vendorId).lean()
    const shippingInfo =
        (await ShippingInfo.findOne({ vendorId }).lean()) || null

    // Attach related data to the order object
    const detailedOrder = {
        ...order,
        products: detailedProducts,
        vendor,
        customer,
        shippingInfo,
    }

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(detailedOrder))

    res.status(200).json({
        status: 'success',
        cached: false,
        message: 'Order details',
        doc: detailedOrder,
    })
})

export const updateOrderById = updateOne(Order)
