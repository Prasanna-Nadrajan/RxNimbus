import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Medicine',
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  orderItems: [lineItemSchema],
  taxAmount: {
    type: Number,
    required: true,
    default: 0.0,
  },
  discountAmount: {
    type: Number,
    required: true,
    default: 0.0,
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0.0,
  },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
