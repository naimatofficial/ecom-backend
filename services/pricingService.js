import Product from '../models/sellers/productModel.js'

class PricingService {
    async getProductPrice(productId) {
        console.log(`Calcuating product price ${productId}`)
        const product = await Product.findById(productId)

        const totalPrice = product.price - product.discountAmount

        return totalPrice
    }
}

export default PricingService
