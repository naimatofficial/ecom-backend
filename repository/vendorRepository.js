import Vendor from '../../models/sellers/vendorModel.js'

class VendorRepository {
    async getVendorById(vendorId) {
        return await Vendor.findById(vendorId)
    }
}

export default VendorRepository
