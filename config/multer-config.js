import multer from 'multer'
import path from 'path'

// Set storage engine for product thumbnail
const storageThumbnail = multer.diskStorage({
    destination: './uploads/thumbnails',
    filename: function (req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        )
    },
})

const storageLogo = multer.diskStorage({
    destination: './uploads/logo',
    filename: function (req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        )
    },
})

// Set storage engine for additional images
const storageImages = multer.diskStorage({
    destination: './uploads/images',
    filename: function (req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        )
    },
})

// Initialize single image upload middleware
const uploadThumbnail = multer({
    storage: storageThumbnail,
    limits: { fileSize: 1000000 }, // Limit to 1MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb)
    },
}).single('thumbnail')

// Initialize single image upload middleware
const uploadLogo = multer({
    storage: storageLogo,
    limits: { fileSize: 1000000 }, // Limit to 1MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb)
    },
}).single('logo')

// Initialize multiple images upload middleware
const uploadImages = multer({
    storage: storageImages,
    limits: { fileSize: 1000000 }, // Limit to 1MB per file
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb)
    },
}).array('images', 5) // Limit to 5 files

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    )
    const mimetype = filetypes.test(file.mimetype)

    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb('Error: Images Only!')
    }
}

export { uploadLogo, uploadThumbnail, uploadImages }
