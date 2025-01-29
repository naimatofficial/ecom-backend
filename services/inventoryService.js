import Product from '../models/sellers/productModel.js'

class InventoryService {
    async checkStock(productId) {
        console.log(`Checking stock for product ${productId}`)
        // Logic to check stock
        const product = await Product.findById(productId)

        if (!product) {
            throw new Error('Product not found.')
        }
        return product.stock > 0
    }
}

export default InventoryService
