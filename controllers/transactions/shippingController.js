import axios from 'axios'
import keys from '../../config/keys.js'
import catchAsync from '../../utils/catchAsync.js'
import AppError from '../../utils/appError.js'

// Function to calculate shipping charges
export const calculateShippingCharges = catchAsync(async (req, res, next) => {
    const { originCityId, destinationCityId, weight, price } = req.body

    // Validate input
    if (!originCityId || !destinationCityId || !weight || price == null) {
        return next(new AppError('Missing required fields.', 400))
    }

    const shippingData = {
        service_type_id: 1,
        origin_city_id: originCityId,
        destination_city_id: destinationCityId,
        estimated_weight: weight,
        shipping_mode_id: 1,
        amount: price,
    }

    try {
        // Make the API request to the Trax API
        const { data } = await axios.post(
            `${keys.traxAPI}/charges_calculate`,
            shippingData,
            {
                headers: {
                    Authorization: keys.traxAuth,
                },
            }
        )

        // Return the calculated shipping charges
        res.status(200).json({
            status: 'success',
            message: 'Trax Shipping price',
            doc: data,
        })
    } catch (err) {
        console.error('Error calculating shipping charges:', err.message)
        return next(new AppError('Failed to fetch shipping charges.', 500))
    }
})
