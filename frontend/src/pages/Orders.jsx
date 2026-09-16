import { useState, useEffect } from 'react';
import { ordersAPI } from '../api';
import { Plus, Edit2, Trash2, CheckCircle2, Clock } from 'lucide-react';

export default function Orders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, customer_name: '', description: '', total_amount: '', status: 'pending', order_date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchOrders();
    window.addEventListener('zahi_data_updated', fetchOrders);
    return () => window.removeEventListener('zahi_data_updated', fetchOrders);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await ordersAPI.update(formData);
      } else {
        await ordersAPI.add(formData);
      }
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await ordersAPI.delete(id);
        fetchOrders();
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({ id: null, customer_name: '', description: '', total_amount: '', status: 'pending', order_date: new Date().toISOString().split('T')[0] });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Orders</h1>
          <p className="text-slate-500 mt-1">Track and manage customer orders.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" /> New Order
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-10 text-slate-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">No orders found.</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="card hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full">
              <div className={`absolute top-0 left-0 w-1 h-full ${item.status === 'finished' ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{item.customer_name}</h3>
                  <p className="text-sm text-slate-500">{item.order_date ? new Date(item.order_date.toString().replace(/-/g, '/')).toLocaleDateString() : '-'}</p>
                </div>
                {item.status === 'finished' ? (
                  <span className="badge-success flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Finished</span>
                ) : (
                  <span className="badge-warning flex items-center"><Clock className="w-3 h-3 mr-1" /> Pending</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-700 line-clamp-3">{item.description}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-lg text-slate-900">LKR {parseFloat(item.total_amount).toLocaleString()}</span>
                <div className="space-x-2">
                  <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-800 p-1"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">{formData.id ? 'Edit Order' : 'New Order'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                <input required type="text" className="input-field" value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea className="input-field min-h-[100px]" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Order details..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount (LKR)</label>
                  <input required type="number" step="0.01" className="input-field" value={formData.total_amount} onChange={(e) => setFormData({...formData, total_amount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Order Date</label>
                  <input required type="date" className="input-field" value={formData.order_date} onChange={(e) => setFormData({...formData, order_date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select className="input-field" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="pending">Pending</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
