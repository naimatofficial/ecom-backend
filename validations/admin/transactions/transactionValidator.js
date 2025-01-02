import Joi from 'joi';

const transactionSchema = Joi.object({
    discountedAmount: Joi.number()
        .required()
        .default(0)
        .messages({
            'number.base': '"Discounted Amount" must be a number',
            'any.required': '"Discounted Amount" is required',
        }),
    vatOrTax: Joi.number()
        .required()
        .default(0)
        .messages({
            'number.base': '"VAT/TAX" must be a number',
            'any.required': '"VAT/TAX" is required',
        }),
    shippingCharge: Joi.number()
        .required()
        .default(0)
        .messages({
            'number.base': '"Shipping Charge" must be a number',
            'any.required': '"Shipping Charge" is required',
        }),
    orderAmount: Joi.number()
        .required()
        .default(0)
        .messages({
            'number.base': '"Order Amount" must be a number',
            'any.required': '"Order Amount" is required',
        }),
    deliveredBy: Joi.string()
        .trim()
        .required()
        .messages({
            'string.base': '"Delivered By" must be a string',
            'any.required': '"Delivered By" is required',
        }),
    deliverymanIncentive: Joi.number()
        .default(0)
        .messages({
            'number.base': '"Deliveryman Incentive" must be a number',
        }),
    adminDiscount: Joi.number()
        .default(0)
        .messages({
            'number.base': '"Admin Discount" must be a number',
        }),
    vendorDiscount: Joi.number()
        .default(0)
        .messages({
            'number.base': '"Vendor Discount" must be a number',
        }),
    adminCommission: Joi.number()
        .required()
        .default(0)
        .messages({
            'number.base': '"Admin Commission" must be a number',
            'any.required': '"Admin Commission" is required',
        }),
    adminNetIncome: Joi.number()
        .required()
        .default(0)
        .messages({
            'number.base': '"Admin Net Income" must be a number',
            'any.required': '"Admin Net Income" is required',
        }),
    vendorNetIncome: Joi.number()
        .required()
        .default(0)
        .messages({
            'number.base': '"Vendor Net Income" must be a number',
            'any.required': '"Vendor Net Income" is required',
        }),
    paymentMethod: Joi.string()
        .trim()
        .required()
        .valid('Cash', 'Digital', 'Wallet', 'Offline')
        .messages({
            'string.base': '"Payment Method" must be a string',
            'any.required': '"Payment Method" is required',
            'any.only': '"Payment Method" must be one of [Cash, Digital, Wallet, Offline]',
        }),
    paymentStatus: Joi.string()
        .trim()
        .required()
        .valid('Completed', 'Pending', 'Failed')
        .messages({
            'string.base': '"Payment Status" must be a string',
            'any.required': '"Payment Status" is required',
            'any.only': '"Payment Status" must be one of [Completed, Pending, Failed]',
        }),
    action: Joi.string()
        .trim()
        .default('')
        .messages({
            'string.base': '"Action" must be a string',
        }),
    totalOrders: Joi.number()
        .required()
        .default(0)
        .messages({
            'number.base': '"Total Orders" must be a number',
            'any.required': '"Total Orders" is required',
        }),
    inHouseOrders: Joi.number()
        .required()
        .default(0)
        .messages({
            'number.base': '"In House Orders" must be a number',
            'any.required': '"In House Orders" is required',
        }),
    vendorOrders: Joi.number()
        .required()
        .default(0)
        .messages({
            'number.base': '"Vendor Orders" must be a number',
            'any.required': '"Vendor Orders" is required',
        }),
    totalProducts: Joi.number()
        .required()
        .default(0)
        .messages({
            'number.base': '"Total Products" must be a number',
            'any.required': '"Total Products" is required',
        }),
    inHouseProducts: Joi.number()
        .required()
        .default(0)
        .messages({
            'number.base': '"In House Products" must be a number',
            'any.required': '"In House Products" is required',
        }),
    vendorProducts: Joi.number()
        .required()
        .default(0)
        .messages({
            'number.base': '"Vendor Products" must be a number',
            'any.required': '"Vendor Products" is required',
        }),
    totalStores: Joi.number()
        .required()
        .default(0)
        .messages({
            'number.base': '"Total Stores" must be a number',
            'any.required': '"Total Stores" is required',
        }),
    totalTransactions: Joi.number()
        .required()
        .default(0)
        .messages({
            'number.base': '"Total Transactions" must be a number',
            'any.required': '"Total Transactions" is required',
        }),
    paymentStatistics: Joi.string()
        .valid('completedPayments', 'cashPayments', 'digitalPayments', 'walletPayments', 'offlinePayments')
        .messages({
            'any.only': '"Payment Statistics" must be one of [completedPayments, cashPayments, digitalPayments, walletPayments, offlinePayments]',
        }),
});

export default transactionSchema;
