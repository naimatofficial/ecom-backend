import {
    InventoryService,
    PricingService,
    CartService,
    CustomerService,
} from './../services/index.js'

class CartFacade {
    constructor() {
        this.customerService = new CustomerService()
        this.inventoryService = new InventoryService()
        this.pricingService = new PricingService()
        this.cartService = new CartService()
    }

    async addToCart(customerId, productId, qty) {
        // check customer
        await this.customerService.checkCustomer(customerId)

        // Check stock
        const isInStock = await this.inventoryService.checkStock(productId)
        if (!isInStock) {
            throw new Error('Product is out of stock.')
        }

        // Add item to cart
        const cart = await this.cartService.addItemToCart(
            customerId,
            productId,
            qty
        )

        // Optionally log or notify
        console.log('Add to cart process completed.')
        return cart
    }
}

export default CartFacade
