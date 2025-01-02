import mongoose from 'mongoose';
import { adminDbConnection } from '../../../config/dbConnections.js'; 

const deliveryManSchema = new mongoose.Schema(
  {
    uploadPictureOnDelivery: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
      required: [true, 'Please specify if uploading picture on delivery is active or inactive'],
    },
  },
  {
    timestamps: true, 
  }
);


const DeliveryMan = adminDbConnection.model('DeliveryMan', deliveryManSchema);

export default DeliveryMan;
