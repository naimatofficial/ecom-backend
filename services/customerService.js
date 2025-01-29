import Customer from '../models/users/customerModel.js'

class CustomerService {
    async checkCustomer(customerId) {
        const customer = await Customer.findById(customerId)

        if (!customer) {
            throw new Error('Customer not found.')
        }

        return
    }
}

export default CustomerService
