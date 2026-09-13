import axios from 'axios';

const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.response.use((response) => {
  if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
    throw new Error('HTML response returned instead of JSON');
  }
  return response;
});

// Helper to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get/set data in LocalStorage
const getStorage = (key, defaultData) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultData;
};
const setStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Initial Mock Data (used only if localStorage is empty)
const initialInventory = [
  { id: 1, item_name: 'Plywood (18mm)', quantity: 10, unit: 'sheets', price: 1200, status: 'in_stock', purchased_date: '2026-09-01' },
  { id: 2, item_name: 'Screws (2 inch)', quantity: 500, unit: 'pcs', price: 2, status: 'in_stock', purchased_date: '2026-09-02' },
  { id: 3, item_name: 'Wood Glue', quantity: 2, unit: 'bottles', price: 250, status: 'needs_purchase', purchased_date: null },
  { id: 4, item_name: 'Teak Wood', quantity: 5, unit: 'cft', price: 4500, status: 'in_stock', purchased_date: '2026-09-10' }
];

const initialOrders = [
  { id: 1, customer_name: 'John Doe', description: 'Custom Wardrobe with sliding doors', total_amount: 15000.00, status: 'pending', order_date: '2026-09-01' },
  { id: 2, customer_name: 'Alice Smith', description: 'Dining Table (6 seater)', total_amount: 25000.00, status: 'finished', order_date: '2026-09-05' }
];

const initialInvoices = [
  { id: 1, order_id: 2, customer_name: 'Alice Smith', description: 'Dining Table (6 seater)', invoice_date: '2026-09-10', amount: 25000.00, status: 'paid' }
];

// Initialize localStorage
if (!localStorage.getItem('zahi_inventory')) setStorage('zahi_inventory', initialInventory);
if (!localStorage.getItem('zahi_orders')) setStorage('zahi_orders', initialOrders);
if (!localStorage.getItem('zahi_invoices')) setStorage('zahi_invoices', initialInvoices);

export const inventoryAPI = {
  getAll: async () => {
    try { return await api.get('/inventory.php'); }
    catch (e) { await delay(500); return { data: getStorage('zahi_inventory', []) }; }
  },
  getSummary: async (fromDate, toDate) => {
    try {
      return await api.get(`/inventory.php?from_date=${fromDate}&to_date=${toDate}`);
    }
    catch (e) {
      await delay(500);
      const inv = getStorage('zahi_inventory', []);
      const filteredInv = inv.filter(i => {
        if (!i.purchased_date) return false;
        const d = new Date(i.purchased_date);
        return d >= new Date(fromDate) && d <= new Date(toDate);
      });
      return {
        data: {
          inventory: {
            total_items: filteredInv.length,
            items_to_buy: filteredInv.filter(i => i.status === 'needs_purchase').length
          }
        }
      };
    }
  },
  add: async (data) => {
    try { return await api.post('/inventory.php', data); }
    catch (e) {
      await delay(500);
      const inv = getStorage('zahi_inventory', []);
      data.id = inv.length ? Math.max(...inv.map(i => i.id)) + 1 : 1;
      setStorage('zahi_inventory', [data, ...inv]);
      return { data: { message: 'Success' } };
    }
  },
  update: async (data) => {
    try { return await api.put('/inventory.php', data); }
    catch (e) {
      await delay(500);
      let inv = getStorage('zahi_inventory', []);
      inv = inv.map(i => i.id === data.id ? data : i);
      setStorage('zahi_inventory', inv);
      return { data: { message: 'Success' } };
    }
  },
  delete: async (id) => {
    try { return await api.delete('/inventory.php', { data: { id } }); }
    catch (e) {
      await delay(500);
      let inv = getStorage('zahi_inventory', []);
      setStorage('zahi_inventory', inv.filter(i => i.id !== id));
      return { data: { message: 'Success' } };
    }
  },
};

export const ordersAPI = {
  getAll: async () => {
    try { return await api.get('/orders.php'); }
    catch (e) { await delay(500); return { data: getStorage('zahi_orders', []) }; }
  },
  getSummary: async (fromDate, toDate) => {
    try {
      return await api.get(`/orders.php?summary=true&from_date=${fromDate}&to_date=${toDate}`);
    }
    catch (e) {
      await delay(500);
      const orders = getStorage('zahi_orders', []);
      const inv = getStorage('zahi_inventory', []);
      // Filter mock orders by date range
      const filteredOrders = orders.filter(o => {
        const d = new Date(o.order_date);
        return d >= new Date(fromDate) && d <= new Date(toDate);
      });
      return {
        data: {
          orders: {
            total_orders: filteredOrders.length,
            finished_orders: filteredOrders.filter(o => o.status === 'finished').length,
            total_revenue: filteredOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0)
          },
          inventory: { total_items: inv.length, items_to_buy: inv.filter(i => i.status === 'needs_purchase').length }
        }
      };
    }
  },
  add: async (data) => {
    try { return await api.post('/orders.php', data); }
    catch (e) {
      await delay(500);
      const orders = getStorage('zahi_orders', []);
      data.id = orders.length ? Math.max(...orders.map(i => i.id)) + 1 : 1;
      setStorage('zahi_orders', [data, ...orders]);
      return { data: { message: 'Success' } };
    }
  },
  update: async (data) => {
    try { return await api.put('/orders.php', data); }
    catch (e) {
      await delay(500);
      let orders = getStorage('zahi_orders', []);
      orders = orders.map(i => i.id === data.id ? data : i);
      setStorage('zahi_orders', orders);
      return { data: { message: 'Success' } };
    }
  },
  delete: async (id) => {
    try { return await api.delete('/orders.php', { data: { id } }); }
    catch (e) {
      await delay(500);
      let orders = getStorage('zahi_orders', []);
      setStorage('zahi_orders', orders.filter(i => i.id !== id));
      return { data: { message: 'Success' } };
    }
  },
};

export const invoicesAPI = {
  getAll: async () => {
    try { return await api.get('/invoices.php'); }
    catch (e) { await delay(500); return { data: getStorage('zahi_invoices', []) }; }
  },
  add: async (data) => {
    try { return await api.post('/invoices.php', data); }
    catch (e) {
      await delay(500);
      const invoices = getStorage('zahi_invoices', []);
      data.id = invoices.length ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
      const orders = getStorage('zahi_orders', []);
      const order = orders.find(o => o.id == data.order_id);
      if (order) { data.customer_name = order.customer_name; data.description = order.description; }
      setStorage('zahi_invoices', [data, ...invoices]);
      return { data: { message: 'Success' } };
    }
  },
  update: async (data) => {
    try { return await api.put('/invoices.php', data); }
    catch (e) {
      await delay(500);
      let invoices = getStorage('zahi_invoices', []);
      invoices = invoices.map(i => i.id === data.id ? { ...i, ...data } : i);
      setStorage('zahi_invoices', invoices);
      return { data: { message: 'Success' } };
    }
  },
  delete: async (id) => {
    try { return await api.delete('/invoices.php', { data: { id } }); }
    catch (e) {
      await delay(500);
      let invoices = getStorage('zahi_invoices', []);
      setStorage('zahi_invoices', invoices.filter(i => i.id !== id));
      return { data: { message: 'Success' } };
    }
  },
};
