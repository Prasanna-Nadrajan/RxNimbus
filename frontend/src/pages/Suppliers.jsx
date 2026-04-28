import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

const Suppliers = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', contactPerson: '', email: '', phone: '', address: ''
  });

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await api.get('/suppliers');
      return response.data;
    }
  });

  const addSupplierMutation = useMutation({
    mutationFn: (newSupplier) => api.post('/suppliers', newSupplier),
    onSuccess: () => {
      queryClient.invalidateQueries('suppliers');
      setShowForm(false);
      setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addSupplierMutation.mutate(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Suppliers Directory</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="flat-button flat-button-primary"
        >
          {showForm ? 'Cancel' : 'Add Supplier'}
        </button>
      </div>

      {showForm && (
        <div className="flat-card mb-6 animate-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold mb-4">Add New Supplier</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Company Name</label><input required name="name" value={formData.name} onChange={handleChange} className="flat-input mt-1" /></div>
            <div><label className="text-sm font-medium">Contact Person</label><input required name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="flat-input mt-1" /></div>
            <div><label className="text-sm font-medium">Email Address</label><input required type="email" name="email" value={formData.email} onChange={handleChange} className="flat-input mt-1" /></div>
            <div><label className="text-sm font-medium">Phone Number</label><input required name="phone" value={formData.phone} onChange={handleChange} className="flat-input mt-1" /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium">Physical Address</label><input name="address" value={formData.address} onChange={handleChange} className="flat-input mt-1" /></div>
            
            <div className="md:col-span-2 flex justify-end">
              <button disabled={addSupplierMutation.isPending} type="submit" className="flat-button flat-button-success">
                {addSupplierMutation.isPending ? 'Saving...' : 'Save Supplier'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flat-card overflow-x-auto">
        {isLoading ? (
          <p className="text-gray-500">Loading supplier data...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 font-semibold text-gray-700">Company Name</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Contact Person</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Phone</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Address</th>
              </tr>
            </thead>
            <tbody>
              {suppliers?.map((supplier) => (
                <tr key={supplier._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-800">{supplier.name}</td>
                  <td className="py-3 px-4 text-gray-600">{supplier.contactPerson}</td>
                  <td className="py-3 px-4 text-gray-600">{supplier.email}</td>
                  <td className="py-3 px-4 text-gray-600">{supplier.phone}</td>
                  <td className="py-3 px-4 text-gray-500 text-sm max-w-xs truncate">{supplier.address}</td>
                </tr>
              ))}
              {suppliers?.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-500">No suppliers found. Click "Add Supplier" to create one.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Suppliers;
