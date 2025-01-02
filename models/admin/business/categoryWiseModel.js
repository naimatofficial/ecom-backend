import mongoose from "mongoose";
import { adminDbConnection } from '../../../config/dbConnections.js'; 

const categoryWiseSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "Image is required"],
      trim: true,
    },
    categoryName: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    costPerProduct: {
      type: Number,
      required: [true, "Cost per product is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active", 
      required: [true, "Status is required"],
    },
  },
  {
    timestamps: true, 
  }
);


const CategoryWise = adminDbConnection.model("CategoryWise", categoryWiseSchema);

export default CategoryWise;
