import express from 'express'
import {
    deleteImage,
    deleteImages,
    getImageUrl,
    getProductImageUrl,
    uploadImage,
} from '../controllers/uploadController.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'
import multer from 'multer'

const router = express.Router()

// Configure multer to handle image uploads
const storage = multer.memoryStorage() // Store the image in memory (instead of a file system)
const upload = multer({ storage }).single('image') // 'image' is the key you're using on the client-side

router.post('/upload-image', upload, uploadImage)
router.get('/upload', getImageUrl)
router.get('/upload/product', protect, getProductImageUrl)

router.delete('/delete-image', deleteImage)
router.delete('/delete-images', deleteImages)

export default router
