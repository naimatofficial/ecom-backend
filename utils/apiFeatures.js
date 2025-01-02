class APIFeatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    // filter() {
    //     // 1A) base filter
    //     const queryObj = { ...this.queryString }
    //     const excludedFields = ['page', 'limit', 'sort', 'fields']
    //     excludedFields.forEach((el) => delete queryObj[el])

    //     // 1B) Advance filtering
    //     let queryStr = JSON.stringify(queryObj)
    //     queryStr = queryStr.replace(
    //         /\b(gte|gt|lte|lt)\b/g,
    //         (match) => `$${match}`
    //     )

    //     this.query.find(JSON.parse(queryStr))

    //     return this
    // }

    // filter() {
    //     // 1A) Base filter
    //     const queryObj = { ...this.queryString }
    //     const excludedFields = ['page', 'limit', 'sort', 'fields', 'query']
    //     excludedFields.forEach((el) => delete queryObj[el])

    //     // 1B) Advanced filtering
    //     let queryStr = JSON.stringify(queryObj)
    //     queryStr = queryStr.replace(
    //         /\b(gte|gt|lte|lt)\b/g,
    //         (match) => `$${match}`
    //     )

    //     // Parse the query string
    //     const parsedFilters = JSON.parse(queryStr)

    //     // 1C) Handle 'query' parameter for name regex search
    //     if (this.queryString.query) {
    //         parsedFilters.name = {
    //             $regex: this.queryString.query,
    //             $options: 'i',
    //         }
    //     }

    //     // Apply filters to the query
    //     this.query.find(parsedFilters)

    //     return this
    // }

    // 1) Filter logic
    filter() {
        const queryObj = { ...this.queryString }
        const excludedFields = [
            'page',
            'sort',
            'limit',
            'fields',
            'startDate',
            'endDate',
            'timeFrame',
        ]
        excludedFields.forEach((el) => delete queryObj[el])

        // Advanced filtering (for numeric filters like gte, gt, lte, lt)
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}` // MongoDB uses `$gte`, `$gt`, `$lte`, `$lt`
        )

        const filters = JSON.parse(queryStr)

        // Apply filters to the query
        this.query = this.query.find(filters)

        // Handle date filtering separately
        this.filterByDate()

        return this
    }

    // 2) Date filtering logic
    filterByDate() {
        const { startDate, endDate, timeFrame } = this.queryString

        let start, end
        const currentDate = new Date()

        // Time frame filtering
        if (timeFrame) {
            switch (timeFrame) {
                case 'year':
                    start = new Date(currentDate.getFullYear(), 0, 1)
                    end = new Date(currentDate.getFullYear() + 1, 0, 1)
                    break
                case 'month':
                    start = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        1
                    )
                    end = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() + 1,
                        1
                    )
                    break
                case 'week':
                    const day = currentDate.getDay() || 7 // Treat Sunday as the 7th day
                    start = new Date(currentDate)
                    start.setHours(0, 0, 0, 0)
                    start.setDate(currentDate.getDate() - day + 1)
                    end = new Date(start)
                    end.setDate(start.getDate() + 6)
                    end.setHours(23, 59, 59, 999)
                    break
                default:
                    throw new Error('Invalid time frame specified')
            }
        }

        // Custom date range filtering
        if (startDate || endDate) {
            start = startDate ? new Date(startDate) : start
            end = endDate ? new Date(endDate) : end
        }

        // Apply filtering to the query
        if (start && end) {
            this.query = this.query.find({
                created_at: {
                    $gte: start,
                    $lte: end,
                },
            })
        }

        return this
    }

    sort() {
        if (this.queryString.sort) {
            // const sortBy = req.query.sort.replace(',', ' ');
            const sortBy = this.queryString.sort.split(',').join(' ')
            // sort('sort = price') [Ascending] &
            // sort('sort = -price')[Descending]
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort('-createdAt')
        }

        return this
    }

    fieldsLimit() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ')
            // like: select('name price duration)
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select('-__v')
        }

        return this
    }

    paginate() {
        if (this.queryString.limit) {
            const page = this.queryString.page * 1 || 1
            const limit = this.queryString.limit * 1
            const skip = (page - 1) * limit

            this.query = this.query.skip(skip).limit(limit)
        } else {
            this.query = this.query.limit(0) // Fetch all products
        }

        return this
    }
}

export default APIFeatures
