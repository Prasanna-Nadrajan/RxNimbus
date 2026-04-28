import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

const Inventory = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: '', manufacturer: '', batchNo: '', 
    expiryDate: '', purchasePrice: '', retailPrice: '', stockQuantity: ''
  });

  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines'],
    queryFn: async () => {
      const response = await api.get('/medicines');
      return response.data;
    }
  });

  const addMedicineMutation = useMutation({
    mutationFn: (newMed) => api.post('/medicines', newMed),
    onSuccess: () => {
      queryClient.invalidateQueries('medicines');
      setShowForm(false);
      setFormData({
        name: '', category: '', manufacturer: '', batchNo: '', 
        expiryDate: '', purchasePrice: '', retailPrice: '', stockQuantity: ''
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addMedicineMutation.mutate({
      ...formData,
      purchasePrice: Number(formData.purchasePrice),
      retailPrice: Number(formData.retailPrice),
      stockQuantity: Number(formData.stockQuantity)
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="flat-button flat-button-primary"
        >
          {showForm ? 'Cancel' : 'Add Medicine'}
        </button>
      </div>

      {showForm && (
        <div className="flat-card mb-6 animate-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold mb-4">Add New Medicine</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Name</label><input required name="name" value={formData.name} onChange={handleChange} className="flat-input mt-1" /></div>
            <div><label className="text-sm font-medium">Category</label><input required name="category" value={formData.category} onChange={handleChange} className="flat-input mt-1" /></div>
            <div><label className="text-sm font-medium">Manufacturer</label><input required name="manufacturer" value={formData.manufacturer} onChange={handleChange} className="flat-input mt-1" /></div>
            <div><label className="text-sm font-medium">Batch No</label><input required name="batchNo" value={formData.batchNo} onChange={handleChange} className="flat-input mt-1" /></div>
            <div><label className="text-sm font-medium">Expiry Date</label><input required type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="flat-input mt-1" /></div>
            <div><label className="text-sm font-medium">Stock Qty</label><input required type="number" min="0" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} className="flat-input mt-1" /></div>
            <div><label className="text-sm font-medium">Purchase Price</label><input required type="number" step="0.01" min="0" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} className="flat-input mt-1" /></div>
            <div><label className="text-sm font-medium">Retail Price</label><input required type="number" step="0.01" min="0" name="retailPrice" value={formData.retailPrice} onChange={handleChange} className="flat-input mt-1" /></div>
            <div className="md:col-span-2 flex justify-end">
              <button disabled={addMedicineMutation.isPending} type="submit" className="flat-button flat-button-success">
                {addMedicineMutation.isPending ? 'Saving...' : 'Save Medicine'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flat-card overflow-x-auto">
        {isLoading ? (
          <p className="text-gray-500">Loading inventory...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Batch No</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Stock</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Expiry Date</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Price</th>
              </tr>
            </thead>
            <tbody>
              {medicines?.map((med) => (
                <tr key={med._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-800">{med.name}</td>
                  <td className="py-3 px-4 text-gray-600">{med.category}</td>
                  <td className="py-3 px-4 text-gray-600">{med.batchNo}</td>
                  <td className="py-3 px-4">
                    <span className={`flat-badge ${med.stockQuantity < 20 ? 'flat-badge-danger' : 'flat-badge-success'}`}>
                      {med.stockQuantity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{new Date(med.expiryDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-gray-800 font-medium">${med.retailPrice.toFixed(2)}</td>
                </tr>
              ))}
              {medicines?.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500">No medicines found in inventory.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Inventory;
