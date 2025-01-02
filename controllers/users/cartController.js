import Cart from '../../models/users/cartModel.js'
import Product from '../../models/sellers/productModel.js'
import Customer from '../../models/users/customerModel.js'
import AppError from '../../utils/appError.js'
import catchAsync from '../../utils/catchAsync.js'
import { getCacheKey } from '../../utils/helpers.js'
import redisClient from '../../config/redisConfig.js'

import { getAll } from './../../factory/handleFactory.js'
import { deleteKeysByPattern } from '../../services/redisService.js'
import Vendor from '../../models/sellers/vendorModel.js'
import keys from '../../config/keys.js'
import ShippingInfo from '../../models/sellers/shippingInfoModel.js'

export const getAllcarts = getAll(Cart)

export const deletecart = catchAsync(async (req, res, next) => {
    const { customerId } = req.params

    const doc = await Cart.findOneAndDelete({
        customer: customerId,
    }).exec()

    // Handle case where the document was not found
    if (!doc) {
        return next(new AppError(`No cart found with that ID`, 404))
    }

    await deleteKeysByPattern('Cart')

    res.status(204).json({
        status: 'success',
        doc: null,
    })
})

export const getCartByCustomer = catchAsync(async (req, res, next) => {
    const { customerId } = req.params

    const cacheKey = getCacheKey('Cart', customerId)

    // Check cache first
    const cachedDoc = await redisClient.get(cacheKey)

    if (cachedDoc) {
        return res.status(200).json({
            status: 'success',
            cached: true,
            doc: JSON.parse(cachedDoc),
        })
    }

    // If not in cache, fetch from database
    let cart = await Cart.findOne({ customer: customerId }).lean()

    if (!cart) {
        return next(new AppError(`No cart found with that customer ID.`, 404))
    }

    // Ensure `cart.orders` exists and is an array
    const orders = Array.isArray(cart.orders) ? cart.orders : []

    // Flatten all product IDs from cartItems
    const productIds = orders.flatMap((order) =>
        Array.isArray(order.cartItems)
            ? order.cartItems.map((item) => item.product)
            : []
    )

    // Fetch product details for all product IDs
    const products = await Product.find({
        _id: { $in: productIds },
    })
        .select(
            'name price thumbnail slug userId discountAmount taxIncluded taxAmount weight category'
        )
        .lean()

    // Create a mapping of product details by product ID
    const productMap = products.reduce((acc, product) => {
        acc[product._id.toString()] = product
        return acc
    }, {})

    // Merge product details into cartItems
    cart.orders = orders.map((order) => ({
        ...order,
        cartItems: Array.isArray(order.cartItems)
            ? order.cartItems.map((item) => ({
                  ...item,
                  product: productMap[item.product.toString()] || null,
              }))
            : [],
    }))

    // Cache the result
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(cart))

    res.status(200).json({
        status: 'success',
        cached: false,
        doc: cart,
    })
})

// export const addProductToCart = catchAsync(async (req, res, next) => {
//     const { productId, qty } = req.body
//     const customerId = req.user._id

//     // Validate product existence and status
//     const product = await Product.findOne({
//         _id: productId,
//         status: 'approved',
//     })
//     if (!product) {
//         return next(new AppError('Product not found or not approved.', 400))
//     }

//     // Validate customer existence
//     const customerExists = await Customer.findById(customerId)
//     if (!customerExists) {
//         return next(new AppError('Customer not found.', 400))
//     }

//     // Validate quantity
//     if (!qty || qty < 1) {
//         return next(new AppError('Quantity must be at least 1.', 400))
//     }

//     // Check if the cart exists for the customer
//     let cart = await Cart.findOne({ customer: customerId })

//     if (!cart) {
//         // Create a new cart if none exists
//         const newCartItem = {
//             product: productId,
//             quantity: qty,
//             price: product.price,
//             discount: product.discount || 0,
//             tax: product.tax || 0,
//         }

//         cart = new Cart({
//             customer: customerId,
//             cartItems: [newCartItem],
//             totalQty: qty,
//             totalPrice: calculateCartTotals([newCartItem]).totalPrice,
//         })
//     } else {
//         // Update existing cart
//         const existingCartItemIndex = cart.cartItems.findIndex(
//             (item) => item.product.toString() === productId
//         )

//         if (existingCartItemIndex > -1) {
//             // Update quantity if product already exists in the cart
//             cart.cartItems[existingCartItemIndex].quantity += qty
//         } else {
//             // Add new product to the cart
//             cart.cartItems.push({
//                 product: productId,
//                 quantity: qty,
//                 price: product.price,
//                 discount: product.discount || 0,
//                 tax: product.tax || 0,
//             })
//         }

//         // Recalculate totals
//         const totals = calculateCartTotals(cart.cartItems)
//         cart.totalQty = totals.totalQty
//         cart.totalPrice = totals.totalPrice
//     }

//     await cart.save()

//     // Clear cached cart data
//     await deleteKeysByPattern('Cart')

//     res.status(200).json({
//         status: 'success',
//         data: cart,
//     })
// })

// Helper function to calculate totals

// export const addToCart = catchAsync(async (req, res) => {
//     const { customerId, productId, qty, shippingPrice } = req.body

//     // Validate inputs
//     if (!customerId || !productId || !qty) {
//         return res.status(400).json({
//             error: 'Customer ID, Product ID, and Quantity are required.',
//         })
//     }

//     if (qty < 1) {
//         return res.status(400).json({ error: 'Quantity must be at least 1.' })
//     }

//     // Fetch the product details
//     const product = await Product.findById(productId)
//     if (!product) {
//         return res.status(404).json({ error: 'Product not found.' })
//     }

//     // Check if the vendor exists
//     const vendor = await Vendor.findById(product.userId)
//     if (!vendor) {
//         return res.status(404).json({ error: 'Vendor not found.' })
//     }

//     // Fetch or create the cart
//     let cart = await Cart.findOne({ customer: customerId })
//     if (!cart) {
//         cart = new Cart({
//             customer: customerId,
//             cartItems: [],
//             totalQty: 0,
//             subTotalAmount: 0,
//             totalShippingCost: 0,
//             totalAmount: 0,
//             vendors: [vendor._id],
//         })
//     }

//     // Check if the product already exists in the cart
//     const existingItemIndex = cart.cartItems.findIndex(
//         (item) => item.product.toString() === productId
//     )

//     if (existingItemIndex > -1) {
//         // Update the existing item's quantity and price
//         cart.cartItems[existingItemIndex].qty += qty
//         cart.cartItems[existingItemIndex].price = product.price
//         cart.cartItems[existingItemIndex].discount = product.discount || 0
//         cart.cartItems[existingItemIndex].tax = product.tax || 0
//     } else {
//         // Add new item to cart
//         cart.cartItems.push({
//             product: productId,
//             qty,
//             price: product.price,
//             discount: product.discount || 0,
//             tax: product.tax || 0,
//         })

//         // Add vendor to the cart if not already present
//         if (!cart.vendors.includes(vendor._id)) {
//             cart.vendors.push(vendor._id)
//         }
//     }

//     // Recalculate totals
//     let totalQty = 0
//     let subTotalAmount = 0
//     let totalAmount = 0
//     let totalShippingCost = 0

//     cart.cartItems.forEach((item) => {
//         totalQty += item.qty
//         subTotalAmount += item.qty * item.price
//         totalAmount += item.qty * (item.price + item.tax - item.discount)
//     })

//     cart.totalQty = totalQty
//     cart.subTotalAmount = subTotalAmount
//     cart.totalAmount = totalAmount

//     await cart.save()

//     res.status(200).json({
//         message: 'Item added to cart successfully.',
//         doc: cart,
//     })
// })

const calculateShippingCharges = catchAsync(
    async (totalAmount, totalWeight, originCityId, destinationCityId) => {
        const shippingData = {
            service_type_id: 1,
            origin_city_id: originCityId,
            destination_city_id: destinationCityId,
            estimated_weight: totalWeight,
            shipping_mode_id: 1,
            amount: totalPrice,
        }

        const { data } = await axios.post(
            `${keys.traxAPI}/charges_calculate`,
            shippingData,
            {
                headers: {
                    Authorization: keys.traxAuth,
                },
            }
        )

        const weightCharges = data?.information?.charges?.weight || 0
        const gst = data?.information?.charges?.gst || 0
        const fuelCharge = data?.information?.charges?.fuel_surcharge || 0
        const netShippingCharges = Number(
            (weightCharges + fuelCharge + gst).toFixed(2)
        )

        return netShippingCharges
    }
)

export const addOrUpdateCart = catchAsync(async (req, res, next) => {
    const { productId, qty, customerId, destinationCityId } = req.body

    if (!productId || qty < 1) {
        return next(new AppError('Invalid product ID or quantity.', 400))
    }

    // Fetch product and vendor details
    const product = await Product.findById(productId)
    if (!product || product.status !== 'approved') {
        return next(new AppError('Product not found or not approved.', 404))
    }

    const vendorId = product.userId

    const vendorShippingInfo = await ShippingInfo.findByOne({ vendorId })

    if (!vendorShippingInfo) {
        return next(
            new AppError('Sorry!, Vendor Shipping Information not found.', 404)
        )
    }

    // Find or create the cart for the customer
    let cart = await Cart.findOne({ customer: customerId })
    if (!cart) {
        cart = new Cart({ customer: customerId, orders: [] })
    }

    // Find or create an order for the vendor
    let vendorOrder = cart.orders.find(
        (order) => order.vendor.toString() === vendorId.toString()
    )

    if (!vendorOrder) {
        vendorOrder = {
            vendor: vendorId,
            cartItems: [],
            totalQty: 0,
            subTotalAmount: 0,
            totalTaxAmount: 0,
            totalAmount: 0,
            totalWeight: 0,
            totalShippingCost: 0,
        }
        cart.orders.push(vendorOrder) // Push the new vendor order to cart.orders
    }

    // Find the product in the vendor's order or add it
    const existingItemIndex = vendorOrder.cartItems.findIndex(
        (item) => item.product.toString() === productId
    )

    if (existingItemIndex > -1) {
        // Update quantity for the existing product
        vendorOrder.cartItems[existingItemIndex].qty = qty
    } else {
        // Add new product to the order
        vendorOrder.cartItems.push({
            product: productId,
            qty,
            price: product.price,
            discount: product.discountAmount || 0,
            tax: product.tax || 0,
        })
    }

    // Recalculate totals for the vendor's order
    vendorOrder.totalQty = vendorOrder.cartItems.reduce(
        (sum, item) => sum + item.qty,
        0
    )

    // Calculate subtotal as price * qty for each item
    vendorOrder.subTotalAmount = vendorOrder.cartItems.reduce(
        (sum, item) => sum + item.qty * item.price,
        0
    )

    // Calculate total discount as discount * qty for each item
    vendorOrder.totalDiscountAmount = vendorOrder.cartItems.reduce(
        (sum, item) => sum + item.qty * item.discount,
        0
    )

    vendorOrder.totalTaxAmount = vendorOrder.cartItems.reduce(
        (sum, item) => sum + item.qty * item.tax,
        0
    )

    vendorOrder.totalWeight = vendorOrder.cartItems.reduce(
        (sum, item) => sum + item.weight * item.qty,
        0
    )

    const total =
        vendorOrder.subTotalAmount -
        vendorOrder.totalDiscountAmount +
        vendorOrder.totalTaxAmount

    vendorOrder.totalShippingCost = await calculateShippingCharges(
        total,
        totalWeight,
        vendorShippingInfo.originCityId,
        destinationCityId
    )

    // Calculate total amount as subtotal - total discount + tax for each item
    vendorOrder.totalAmount =
        vendorOrder.subTotalAmount -
        vendorOrder.totalDiscountAmount +
        vendorOrder.totalTaxAmount +
        vendorOrder.totalShippingCost

    // Replace the modified vendor order back into the orders array
    const orderIndex = cart.orders.findIndex(
        (order) => order.vendor.toString() === vendorId.toString()
    )
    cart.orders[orderIndex] = vendorOrder

    // Save updated cart
    await cart.save()

    res.status(200).json({
        status: 'success',
        data: cart,
    })
})

export const removeProductFromcart = catchAsync(async (req, res, next) => {
    const { productId } = req.params
    const customer = req.user._id

    const cart = await cart.findOne({ customer })

    if (!cart) {
        return next(new AppError('No cart found for this customer', 404))
    }
    const productIndex = cart.cartItems.findIndex(
        (product) => product._id.toString() === productId
    )

    if (productIndex === -1) {
        return next(new AppError('Product not found in cart', 404))
    }

    cart.cartItems.splice(productIndex, 1)

    cart.totalProducts = cart.cartItems.length

    await cart.save()

    await deleteKeysByPattern('Cart')

    res.status(200).json({
        status: 'success',
        totalProducts: cart.totalProducts,
        doc: cart,
    })
})
