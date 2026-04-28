import Medicine from '../models/Medicine.js';

export const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({});
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMedicine = async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    const savedMedicine = await medicine.save();
    res.status(201).json(savedMedicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ message: 'Medicine removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const LOW_STOCK_THRESHOLD = 20;
    const EXPIRY_THRESHOLD_DAYS = 90;
    const expiryDateThreshold = new Date();
    expiryDateThreshold.setDate(expiryDateThreshold.getDate() + EXPIRY_THRESHOLD_DAYS);

    const lowStockAlerts = await Medicine.find({
      stockQuantity: { $lt: LOW_STOCK_THRESHOLD }
    });

    const expiringSoonAlerts = await Medicine.find({
      expiryDate: { $lte: expiryDateThreshold }
    });

    res.json({
      lowStock: lowStockAlerts,
      expiringSoon: expiringSoonAlerts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
