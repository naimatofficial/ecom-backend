import dotenv from 'dotenv'

dotenv.config()

class Config {
    static instance

    constructor() {
        if (Config.instance) {
            return Config.instance
        }

        // Initialize configuration keys
        this.port = process.env.PORT || 3000
        this.nodeEnv = process.env.NODE_ENV || 'development'

        // Client side URLs
        this.userClientURL = process.env.USER_CLIENT_URL
        this.sellerClientURL = process.env.SELLER_CLIENT_URL
        this.adminClientURL = process.env.ADMIN_CLIENT_URL

        // Redis configuration
        this.redisURL = process.env.REDIS_URL
        this.redisPassword = process.env.REDIS_PASSWORD

        // Databases
        this.adminDbURI = process.env.ADMIN_DB_URI
        this.sellerDbURI = process.env.SELLER_DB_URI
        this.userDbURI = process.env.USER_DB_URI
        this.transcationDbURI = process.env.TRANSACTION_DB_URI

        // S3 Bucket Keys
        this.AWSS3BucketName = process.env.AWS_S3_BUCKET_NAME
        this.AWSAccessId = process.env.AWS_ACCESS_ID
        this.AWSSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

        // JWT Configuration
        this.jwtSecret = process.env.JWT_SECRET
        this.refreshSecret = process.env.JWT_REFRESH_SECRET
        this.accessTokenExpiresIn = process.env.JWT_ACCESS_TIME
        this.refreshTokenExpiresIn = process.env.JWT_REFRESH_TIME

        // Email Configuration
        this.emailAddress = process.env.EMAIL_ADDRESS
        this.emailPassKey = process.env.EMAIL_PASS_KEY

        // SMS Configuration
        this.lifetimeSMSToken = process.env.SMS_TOKEN
        this.lifetimeSMSSecret = process.env.SMS_SECRET

        // OTP Secret Key
        this.otpSecretKey = process.env.OTP_SECRET_KEY

        // JazzCash Configuration
        this.jazzCashMerchantId = process.env.JAZZCASH_MERCHANT_ID
        this.jazzCashPassword = process.env.JAZZCASH_PASSWORD
        this.jazzCashIntegritySalt = process.env.JAZZCASH_INTEGRITY_SALT
        this.jazzCashReturnUrl = process.env.JAZZCASH_RETURN_URL
        this.jazzCashMobileWalletPostUrl =
            process.env.JAZZCASH_MOBILE_WALLET_POST_URL
        this.jazzCashCardsPostUrl = process.env.JAZZCASH_CARDS_POST_URL
        this.jazzCashPaymentInquireUrl =
            process.env.JAZZCASH_PAYMENT_INQUIRE_URL

        // Trax configruation
        this.traxAPI = process.env.TRAX_API
        this.traxAuth = process.env.TRAX_AUTH

        // Save the instance for subsequent calls
        Config.instance = this
    }
}

// Export a single instance
const keys = new Config()

export default keys
