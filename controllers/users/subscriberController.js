import Subscriber from './../../models/users/subscriberModel.js'
import { createOne, deleteOne, getAll } from '../../factory/handleFactory.js'

export const addSubscriber = createOne(Subscriber)

export const getSubscribers = getAll(Subscriber)

export const deleteSubscriber = deleteOne(Subscriber)
