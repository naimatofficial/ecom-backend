import Product from '../models/sellers/productModel.js'

class ProductRepository {
    async getProductById(productId) {
        return await Product.findById(productId)
    }
}

export default ProductRepository
