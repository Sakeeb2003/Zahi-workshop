import { useState, useEffect } from 'react';
import { ordersAPI } from '../api';
import { Package, ShoppingBag, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);

  useEffect(() => {
    fetchSummary();
  }, []); // Initial load

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getSummary(fromDate, toDate);
      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchSummary();
  };

  const orderStats = summary?.orders || {};
  const invStats = summary?.inventory || {};
  
  // Dummy data for the chart to make the dashboard look dynamic
  const chartData = [
    { name: 'Selected Period', orders: parseInt(orderStats.total_orders) || 0, revenue: parseFloat(orderStats.total_revenue) || 0 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your woodworking business.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <input 
            type="date" 
            className="input-field text-sm py-1.5" 
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <span className="text-slate-400">to</span>
          <input 
            type="date" 
            className="input-field text-sm py-1.5" 
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <button onClick={handleSearch} className="btn-primary py-1.5 text-sm whitespace-nowrap">
            Search
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card border-l-4 border-l-blue-500 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Orders</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{orderStats.total_orders || 0}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-l-green-500 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Finished Orders</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{orderStats.finished_orders || 0}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-l-purple-500 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                LKR {parseFloat(orderStats.total_revenue || 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-l-orange-500 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Items to Buy</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{invStats.items_to_buy || 0}</h3>
              {invStats.items_to_buy > 0 && (
                <p className="text-xs text-orange-600 mt-1 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" /> Action needed
                </p>
              )}
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Revenue Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dx={-10} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Info */}
        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <h3 className="text-lg font-semibold mb-2">Zahi Wood Work Quick Tips</h3>
            <p className="text-slate-300 text-sm mb-4">
              Remember to mark your orders as 'Finished' so you can generate invoices for them. Check inventory regularly!
            </p>
            <div className="w-full bg-slate-700/50 rounded-lg p-3">
               <p className="text-xs text-slate-300 font-medium uppercase tracking-wider mb-1">Total Inventory Items</p>
               <p className="text-2xl font-bold">{invStats.total_items || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
