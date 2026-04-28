import React from 'react';
import { Package, TrendingUp, AlertCircle, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="flat-card flex items-center p-6">
    <div className={`p-4 rounded-full ${colorClass} text-white`}>
      <Icon className="w-8 h-8" />
    </div>
    <div className="ml-5">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  // We'll assume the Seeded admin user is logged in for the demo if a token isn't in localStorage yet
  // In a real app we'd redirect if not logged in.
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
    // Prevent failing if the user isn't fully signed in during testing
    retry: 1,
  });

  const { data: alertsData } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await api.get('/medicines/alerts');
      return response.data;
    },
    retry: 1,
  });

  if (isLoading) return <div className="p-6">Loading dashboard data...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading data. Please ensure you are logged in as Admin.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button className="flat-button flat-button-primary flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Sales" 
          value={`$${(data?.totalSales || 0).toFixed(2)}`} 
          icon={TrendingUp} 
          colorClass="bg-success-emerald" 
        />
        <StatCard 
          title="Total Orders" 
          value={data?.totalOrders || 0} 
          icon={ShoppingCart} 
          colorClass="bg-primary-blue" 
        />
        <StatCard 
          title="Total Medicines" 
          value={data?.inventoryStats?.totalItems || 0} 
          icon={Package} 
          colorClass="bg-indigo-500" 
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={data?.inventoryStats?.lowStockItems || 0} 
          icon={AlertCircle} 
          colorClass="bg-danger-crimson" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flat-card lg:col-span-2 min-h-[400px]">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sales Overview</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-md">
            <span className="text-gray-400">Sales Chart Visualization (Requires Recharts or similar)</span>
          </div>
        </div>

        <div className="flat-card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Expiring Soon</h2>
          <div className="space-y-4">
            {alertsData?.expiringSoon?.length === 0 && (
              <p className="text-gray-500">No medicines expiring soon.</p>
            )}
            {alertsData?.expiringSoon?.slice(0, 5).map((med) => (
              <div key={med._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md transition-colors border border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">{med.name}</p>
                  <p className="text-sm text-gray-500">Batch: {med.batchNo}</p>
                </div>
                <div className="text-right">
                  <span className="flat-badge flat-badge-danger">
                    {new Date(med.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
