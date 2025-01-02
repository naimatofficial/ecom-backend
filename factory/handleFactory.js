import slugify from 'slugify'
import redisClient from '../config/redisConfig.js'
import APIFeatures from '../utils/apiFeatures.js'
import AppError from '../utils/appError.js'
import catchAsync from '../utils/catchAsync.js'
import { getCacheKey } from '../utils/helpers.js'
import mongoose from 'mongoose'
import { deleteKeysByPattern } from '../services/redisService.js'
import Vendor from '../models/sellers/vendorModel.js'

// Check Document fields if they exisit it return data body
// And if not it return Error
export const checkFields = (Model, req, next) => {
    const allowedFields = Object.keys(Model.schema.paths)
    const extraFields = Object.keys(req.body).filter(
        (field) => !allowedFields.includes(field)
    )

    // Add custom handling for allowed fields
    const customAllowedFields = ['userLimit']

    // Check if extra fields are allowed
    const invalidFields = extraFields.filter(
        (field) => !customAllowedFields.includes(field)
    )

    if (invalidFields.length > 0) {
        return next(
            new AppError(
                `These fields are not allowed: ${invalidFields.join(', ')}`,
                400
            )
        )
    }

    const filteredData = Object.keys(req.body).reduce((obj, key) => {
        if (allowedFields.includes(key) || customAllowedFields.includes(key)) {
            obj[key] = req.body[key]
        }
        return obj
    }, {})

    return { allowedFields, filteredData }
}

// DELETE One Document
export const deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id).exec()

        const docName = Model.modelName.toLowerCase() || 'Document'

        // Handle case where the document was not found
        if (!doc) {
            return next(new AppError(`No ${docName} found with that ID`, 404))
        }

        // delete all document caches related to this model
        await deleteKeysByPattern(Model.modelName)
        await deleteKeysByPattern('Search')

        res.status(204).json({
            status: 'success',
            doc: null,
        })
    })

// UPDATE One Document
export const updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        let { allowedFields, filteredData } = checkFields(Model, req, next)

        // if document contain slug then create a slug
        if (allowedFields.includes('slug') && filteredData.name) {
            filteredData = {
                ...filteredData,
                slug: slugify(filteredData.name, { lower: true }),
            }
        }

        const doc = await Model.findByIdAndUpdate(req.params.id, filteredData, {
            new: true,
            runValidators: true,
        })

        const docName = Model?.modelName?.toLowerCase() || 'Document'

        // Handle case where the document was not found
        if (!doc) {
            return next(new AppError(`No ${docName} found with that ID`, 404))
        }

        const cacheKeyOne = getCacheKey(Model.modelName, filteredData.slug)

        // delete pervious document data
        await redisClient.del(cacheKeyOne)
        // updated the cache with new data
        await redisClient.setEx(cacheKeyOne, 3600, JSON.stringify(doc))

        // delete all document caches related to this model
        await deleteKeysByPattern(Model.modelName)
        await deleteKeysByPattern('Search')

        res.status(200).json({
            status: 'success',
            doc,
        })
    })

// CREATE One Document
export const createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        let { allowedFields, filteredData } = checkFields(Model, req, next)

        // if document contain slug then create a slug
        if (allowedFields.includes('slug')) {
            filteredData = {
                ...filteredData,
                slug: slugify(filteredData.name, { lower: true }),
            }
        }

        const doc = await Model.create(filteredData)

        const docName = Model.modelName || 'Document'

        if (!doc) {
            return next(new AppError(`${docName} could not be created`, 400))
        }

        if (
            Model.modelName === 'SubCategory' ||
            Model.modelName === 'SubSubCategory'
        ) {
            const modelCache = getCacheKey('Category', '')
            await redisClient.del(modelCache)
        }

        // delete all document caches related to this model
        await deleteKeysByPattern(Model.modelName)
        await deleteKeysByPattern('Search')

        res.status(201).json({
            status: 'success',
            doc,
        })
    })

// GET One Document
export const getOne = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        const cacheKey = getCacheKey(Model.modelName, req.params.id)

        // Check cache first
        const cachedDoc = await redisClient.get(cacheKey)

        if (cachedDoc) {
            return res.status(200).json({
                status: 'success',
                cached: true,
                doc: JSON.parse(cachedDoc),
            })
        }

        // If not in cache, fetch from database
        let query = Model.findById(req.params.id)

        if (popOptions && popOptions.path) query = query.populate(popOptions)
        const doc = await query

        const docName = Model.modelName.toLowerCase() || 'Document'

        if (!doc) {
            return next(new AppError(`No ${docName} found with that ID`, 404))
        }

        // Cache the result
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(doc))

        res.status(200).json({
            status: 'success',
            cached: false,
            doc,
        })
    })

export const getAll = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        const cacheKey = getCacheKey(Model.modelName, '', req.query)

        // Check cache first
        const cachedResults = await redisClient.get(cacheKey)
        if (cachedResults) {
            return res.status(200).json({
                ...JSON.parse(cachedResults),
                status: 'success',
                cached: true,
            })
        }

        // Base query
        let query = Model.find()

        // Conditionally apply population
        if (popOptions?.path) {
            if (Array.isArray(popOptions.path)) {
                popOptions.path.forEach((pathOption) => {
                    query = query.populate(pathOption)
                })
            } else {
                query = query.populate(popOptions)
            }
        }

        const { sort, limit, page = 1, ...filters } = req.query
        const hasQueryOptions =
            sort || limit || page || Object.keys(filters).length > 0

        let doc, totalDocs

        if (hasQueryOptions) {
            // Step 1: Apply filters and count total documents
            const features = new APIFeatures(query, req.query)
                .filter()
                .sort()
                .fieldsLimit()
            totalDocs = await features.query.clone().countDocuments()

            // Step 2: Apply pagination and fetch data
            features.paginate()
            doc = await features.query
        } else {
            // Fetch all documents if no query options are applied
            doc = await Model.find().lean()
            totalDocs = doc.length
        }

        // Calculate pagination details
        const currentPage = Number(page)
        const limitNum = Number(limit)
        const totalPages = limitNum ? Math.ceil(totalDocs / limitNum) : 1

        const response = {
            status: 'success',
            cached: false,
            totalDocs, // Total count of documents
            results: doc.length, // Number of documents in the current page
            currentPage, // Current page number
            totalPages, // Total number of pages
            doc,
        }

        // Cache the result if not in cache
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(response))

        res.status(200).send(response)
    })

export const getOneBySlug = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        const cacheKey = getCacheKey(Model.modelName, req.params.slug)

        // Check cache first
        const cachedDoc = await redisClient.get(cacheKey)

        if (cachedDoc) {
            return res.status(200).json({
                status: 'success',
                cached: true,
                doc: JSON.parse(cachedDoc),
            })
        }

        // If not in cache, fetch from database
        let query = Model.findOne({ slug: req.params.slug })

        if (popOptions && popOptions?.path) query = query.populate(popOptions)
        const doc = await query

        const docName = Model.modelName.toLowerCase() || 'Document'

        if (!doc) {
            return next(new AppError(`No ${docName} found with that slug`, 404))
        }

        // Cache the result
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(doc))

        res.status(200).json({
            status: 'success',
            cached: false,
            doc,
        })
    })

export const deleteOneWithTransaction = (Model, relatedModels = []) =>
    catchAsync(async (req, res, next) => {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const doc = await Model.findById(req.params.id).session(session)

            if (!doc) {
                await session.abortTransaction()
                return next(
                    new AppError(
                        `No ${Model.modelName.toLowerCase()} found with that ID`,
                        404
                    )
                )
            }

            const cacheKeys = []

            for (const relatedModel of relatedModels) {
                const { model, foreignKey } = relatedModel

                const relatedDocs = await model
                    .find({ [foreignKey]: req.params.id })
                    .session(session)
                if (relatedDocs.length > 0) {
                    await model
                        .deleteMany({ [foreignKey]: req.params.id })
                        .session(session)
                }

                const cacheKey = getCacheKey(model.modelName.toString(), '')
                cacheKeys.push(cacheKey)
            }

            await doc.deleteOne({ session })

            cacheKeys.push(getCacheKey(Model.modelName, req.params.id))
            cacheKeys.push(getCacheKey(Model.modelName, '', req.query))

            await Promise.all([
                session.commitTransaction(),
                redisClient.del(...cacheKeys),
            ])

            session.endSession()

            res.status(204).json({ status: 'success', doc: null })
        } catch (err) {
            await session.abortTransaction()
            session.endSession()
            return next(
                new AppError('Something went wrong during deletion', 500)
            )
        }
    })

// UPDATE Status of Document
export const updateStatus = (Model) =>
    catchAsync(async (req, res, next) => {
        if (!req.body.status) {
            return next(new AppError(`Please provide status value.`, 400))
        }

        // Perform the update operation
        const doc = await Model.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            {
                new: true,
                runValidators: true,
            }
        )

        const docName = Model.modelName.toLowerCase() || 'Document'

        // Handle case where the document was not found
        if (!doc) {
            return next(new AppError(`No ${docName} found with that ID`, 404))
        }

        // delete all document caches related to this model
        await deleteKeysByPattern(Model.modelName)

        if (Model.modelName !== 'Product') {
            await deleteKeysByPattern('Product')
        }
        await deleteKeysByPattern('Brand')
        await deleteKeysByPattern('Category')

        res.status(200).json({
            status: 'success',
            doc,
        })
    })

// UPDATE Publish Status of Document
export const updatePublishStatus = (Model) =>
    catchAsync(async (req, res, next) => {
        if (!req.body.published) {
            return next(
                new AppError(`Please provide publish status value.`, 400)
            )
        }

        // Perform the update operation
        const doc = await Model.findByIdAndUpdate(req.params.id, publish, {
            new: true,
            runValidators: true,
        })

        const docName = Model.modelName.toLowerCase() || 'Document'

        // Handle case where the document was not found
        if (!doc) {
            return next(new AppError(`No ${docName} found with that ID`, 404))
        }

        // delete all document caches related to this model
        await deleteKeysByPattern(Model.modelName)

        res.status(200).json({
            status: 'success',
            doc,
        })
    })

export const cleanCache = catchAsync(async (req, res, next) => {
    try {
        await redisClient.flushAll()
        res.status(200).json({
            status: 'success',
            message: 'Redis cache cleaned.',
        })
    } catch (err) {
        return next(new AppError('Redis cache not cleaned', 400))
    }
})
