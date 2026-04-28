import Order from '../models/Order.js';
import Medicine from '../models/Medicine.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    // Calculate total sales
    const orders = await Order.find({});
    const totalSales = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    const totalMedicines = await Medicine.countDocuments();
    
    // Inventory health
    const LOW_STOCK_THRESHOLD = 20;
    const lowStockCount = await Medicine.countDocuments({
      stockQuantity: { $lt: LOW_STOCK_THRESHOLD }
    });

    res.json({
      totalSales,
      totalOrders,
      inventoryStats: {
        totalItems: totalMedicines,
        lowStockItems: lowStockCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
