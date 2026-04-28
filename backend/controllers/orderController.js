import Order from '../models/Order.js';
import Medicine from '../models/Medicine.js';

export const createOrder = async (req, res) => {
  try {
    const { orderItems, taxAmount, discountAmount, totalAmount } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Verify stock and update quantities
    for (const item of orderItems) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine) {
        return res.status(404).json({ message: `Medicine not found: ${item.name}` });
      }
      if (medicine.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${medicine.name}` });
      }
      medicine.stockQuantity -= item.quantity;
      await medicine.save();
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      taxAmount,
      discountAmount,
      totalAmount,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
