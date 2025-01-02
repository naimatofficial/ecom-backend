import AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'

import config from '../config/keys.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'

const s3 = new AWS.S3({
    credentials: {
        accessKeyId: config.AWSAccessId,
        secretAccessKey: config.AWSSecretAccessKey,
    },
    region: 'ap-southeast-2',
})

export const getImageUrl = catchAsync(async (req, res, next) => {
    // Get the file type from query or default to 'jpeg'
    const fileType = req.query.fileType || 'jpeg'
    const folder = req.query.folder || ''

    // Allow multiple file types
    const validFileTypes = ['jpeg', 'jpg', 'png', 'webp', 'gif']

    if (!validFileTypes.includes(fileType)) {
        return next(new AppError('Invalid file type', 400))
    }

    const key = `${folder}/${uuidv4()}.${fileType}`

    // Use promise-based getSignedUrl to handle async properly
    const params = {
        Bucket: config.AWSS3BucketName,
        ContentType: `image/${fileType}`,
        Key: key,
        Expires: 60 * 5, // URL expires in 5 minutes
    }

    const url = s3.getSignedUrl('putObject', params)

    res.status(200).send({ key, url })
})

export const getProductImageUrl = catchAsync(async (req, res, next) => {
    // Get the file type from query or default to 'jpeg'
    const fileType = req.query.fileType || 'jpeg'

    // Allow multiple file types
    const validFileTypes = ['jpeg', 'jpg', 'png', 'webp', 'gif']

    if (!validFileTypes.includes(fileType)) {
        return next(new AppError('Invalid file type', 400))
    }

    const key = `products/${req.user._id}/${uuidv4()}.${fileType}`

    // Use promise-based getSignedUrl to handle async properly
    const params = {
        Bucket: config.AWSS3BucketName,
        ContentType: `image/${fileType}`,
        Key: key,
    }

    const url = s3.getSignedUrl('putObject', params)

    res.status(200).send({ key, url })
})

export const deleteImage = catchAsync(async (req, res, next) => {
    const { key } = req.body // Key of the image in S3 bucket

    if (!key) {
        return next(new AppError('Image key is required', 400))
    }

    const params = {
        Bucket: config.AWSS3BucketName,
        Key: key,
    }

    await s3.deleteObject(params).promise()

    res.status(200).send({ message: 'Image deleted successfully' })
})

export const updateImage = catchAsync(async (req, res, next) => {
    const { key } = req.body // Key of the image to update
    const fileType = req.query.fileType || 'jpeg'

    // Validate file type
    const validFileTypes = ['jpeg', 'png', 'webp', 'gif']
    if (!validFileTypes.includes(fileType)) {
        return next(new AppError('Invalid file type', 400))
    }

    if (!key) {
        return next(new AppError('Image key is required', 400))
    }

    // First, delete the existing image
    const deleteParams = {
        Bucket: config.AWSS3BucketName,
        Key: key,
    }
    await s3.deleteObject(deleteParams).promise()

    // Then, create a new upload URL for the updated image
    const newKey = `${uuidv4()}.${fileType}`
    const uploadParams = {
        Bucket: config.AWSS3BucketName,
        ContentType: `image/${fileType}`,
        Key: newKey,
    }

    const url = await s3.getSignedUrlPromise('putObject', uploadParams)

    res.status(200).send({ key: newKey, url })
})

export const deleteImages = catchAsync(async (req, res, next) => {
    const { keys } = req.body // Array of image keys in S3 bucket

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
        return next(new AppError('Image keys are required', 400))
    }

    // Prepare the parameters for S3 delete operation
    const deleteParams = {
        Bucket: config.AWSS3BucketName,
        Delete: {
            Objects: keys.map((key) => ({ Key: key })),
            Quiet: false,
        },
    }

    await s3.deleteObjects(deleteParams).promise()

    res.status(200).send({ message: 'Images deleted successfully' })
})
