import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  manufacturer: { type: String, required: true },
  batchNo: { type: String, required: true },
  expiryDate: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v > Date.now();
      },
      message: 'Expiry date must be in the future'
    }
  },
  purchasePrice: { type: Number, required: true, min: 0 },
  retailPrice: { type: Number, required: true, min: 0 },
  stockQuantity: { type: Number, required: true, min: 0 },
}, { timestamps: true });

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;
