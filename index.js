import cron from 'node-cron'

import app from './app.js'
import FeaturedDeal from './models/admin/deals/featuredDealModel.js'
import keys from './config/keys.js'

const port = keys.port || 3000


// Schedule the task here
cron.schedule('0 0 * * *', async () => {
    try {
        const currentDate = new Date()
        await FeaturedDeal.updateMany(
            { endDate: { $lt: currentDate } },
            { $set: { status: 'expired' } }
        )
        console.log('Expired Feartured deals updated successfully')
    } catch (error) {
        console.error('Error updating expired deals:', error)
    }
})

app.listen(port, () => {
    console.log(`
  🚀 Server is up and running!
  🌐 URL: http://localhost:${port}
  🛠️  Environment: ${process.env.NODE_ENV || 'development'}
  📅  Started at: ${new Date().toLocaleString()}
  `)
})
