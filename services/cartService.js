import Product from './../models/sellers/productModel.js'
import Cart from './../models/users/cartModel.js'
import PricingService from './pricingService.js'

const initialCart = {
    cartItems: [],
    totalQty: 0,
    subTotalAmount: 0,
    totalDiscountAmount: 0,
    totalTaxAmount: 0,
    totalAmount: 0,
    totalWeight: 0,
}

class CartService {
    constructor() {
        this.pricingService = new PricingService()
    }

    async addItemToCart(customerId, productId, qty) {
        const product = await Product.findById(productId)

        if (!product) {
            throw new Error('Product not found.')
        }

        console.log({ product })

        const productPrice = await this.pricingService.getProductPrice(
            productId
        )

        console.log({ qty })

        let cart = await Cart.findOne({ customer: customerId })

        if (!cart) {
            // Create a new cart if one does not exist
            cart = new Cart({
                customer: customerId,
                vendor: product.userId,
                ...initialCart,
            })
        }

        const itemIndex = cart.cartItems.findIndex(
            (item) => item.product.toString() === productId
        )

        if (itemIndex > -1) {
            let itemQty = cart.cartItems[itemIndex].qty

            // console.log({ itemQty, qty })
            if (qty < 0 && itemQty < -qty) {
                throw new Error(
                    `Item Quantity in cart ${itemQty}, you are subtracting ${qty}. `,
                    400
                )
            }

            // If item exists, update the quantity
            cart.cartItems[itemIndex].qty += qty
            if (cart.cartItems[itemIndex].qty === 0) {
                cart.cartItems.splice(itemIndex, 1)
            } else cart.cartItems[itemIndex].price = productPrice
        } else {
            // Add a new item to the cart
            cart.cartItems.push({
                product: productId,
                qty,
                price: product.price,
                discount: product.discountAmount || 0,
                tax: product.tax || 0,
                weight: product.weight || 0,
            })

            console.log({ items: cart?.cartItems })
        }

        console.log({ cart })

        // Recalculate totals
        const totals = this.calculateCartTotals(cart)

        // Update cart totals
        cart.totalQty = totals.totalQty
        cart.subTotalAmount = totals.subTotalAmount
        cart.totalDiscountAmount = totals.totalDiscountAmount
        cart.totalTaxAmount = totals.totalTaxAmount
        cart.totalAmount = totals.totalAmount
        cart.totalWeight = totals.totalWeight

        await cart.save()
        return cart
    }

    calculateCartTotals(cart) {
        const totalQty = cart.cartItems.reduce(
            (acc, item) => acc + (Number(item.qty) || 0),
            0
        )

        const subTotalAmount = cart.cartItems.reduce(
            (acc, item) =>
                acc + (Number(item.qty) || 0) * (Number(item.price) || 0),
            0
        )

        const totalDiscountAmount = cart.cartItems.reduce(
            (acc, item) =>
                acc + (Number(item.qty) || 0) * (Number(item.discount) || 0),
            0
        )

        const totalTaxAmount = cart.cartItems.reduce(
            (acc, item) =>
                acc + (Number(item.qty) || 0) * (Number(item.tax) || 0),
            0
        )

        const totalWeight = cart.cartItems.reduce(
            (acc, item) =>
                acc + (Number(item.qty) || 0) * (Number(item.weight) || 0),
            0
        )

        const totalAmount =
            subTotalAmount + totalTaxAmount - totalDiscountAmount

        return {
            totalQty,
            subTotalAmount,
            totalDiscountAmount,
            totalTaxAmount,
            totalAmount,
            totalWeight,
        }
    }
}

export default CartService
