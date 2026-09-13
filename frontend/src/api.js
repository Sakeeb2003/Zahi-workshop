import axios from 'axios';

const CLOUD_DB_ID = 'ff808181a067127101a09be95f320b95';
const CLOUD_DB_URL = `https://api.restful-api.dev/objects/${CLOUD_DB_ID}`;

// Helper to get/set data in LocalStorage
const getStorage = (key, defaultData) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultData;
};
const setStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Initial Mock Data
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
  { id: 1, order_id: 2, customer_name: 'Alice Smith', description: 'Dining Table (6 seater)', invoice_date: '2026-09-10', amount: 25000.00, payment_type: 'full', advance_amount: 0, status: 'paid' }
];

const initialPurchaseLog = [
  { id: 1, item_name: 'Plywood (18mm)', quantity: 10, unit: 'sheets', price_per_unit: 1200, total_cost: 12000, purchased_date: '2026-09-01', notes: 'Initial buy' }
];

// Initialize localStorage defaults
if (!localStorage.getItem('zahi_inventory')) setStorage('zahi_inventory', initialInventory);
if (!localStorage.getItem('zahi_orders')) setStorage('zahi_orders', initialOrders);
if (!localStorage.getItem('zahi_invoices')) setStorage('zahi_invoices', initialInvoices);
if (!localStorage.getItem('zahi_purchase_log')) setStorage('zahi_purchase_log', initialPurchaseLog);

// Helper to push state to Cloud DB
const syncToCloud = async (overrideData = {}) => {
  const currentInv = overrideData.inventory || getStorage('zahi_inventory', initialInventory);
  const currentOrd = overrideData.orders || getStorage('zahi_orders', initialOrders);
  const currentInvcs = overrideData.invoices || getStorage('zahi_invoices', initialInvoices);
  const currentPurLog = overrideData.purchase_log || getStorage('zahi_purchase_log', initialPurchaseLog);

  try {
    await axios.put(CLOUD_DB_URL, {
      name: 'zahi_db',
      data: {
        inventory: currentInv,
        orders: currentOrd,
        invoices: currentInvcs,
        purchase_log: currentPurLog
      }
    }, { headers: { 'Content-Type': 'application/json' }, timeout: 5000 });
  } catch (err) {
    console.warn("Cloud sync warning:", err);
  }
};

// Helper to pull fresh state from Cloud DB
const pullFromCloud = async () => {
  try {
    const res = await axios.get(CLOUD_DB_URL, { timeout: 4000 });
    if (res.data && res.data.data) {
      const d = res.data.data;
      if (Array.isArray(d.inventory)) setStorage('zahi_inventory', d.inventory);
      if (Array.isArray(d.orders)) setStorage('zahi_orders', d.orders);
      if (Array.isArray(d.invoices)) setStorage('zahi_invoices', d.invoices);
      if (Array.isArray(d.purchase_log)) setStorage('zahi_purchase_log', d.purchase_log);
      return d;
    }
  } catch (err) {
    console.warn("Cloud fetch warning:", err);
  }
  return null;
};

// Pull cloud data on initial load
pullFromCloud();

export const inventoryAPI = {
  getAll: async () => {
    await pullFromCloud();
    return { data: getStorage('zahi_inventory', initialInventory) };
  },
  getSummary: async (fromDate, toDate) => {
    await pullFromCloud();
    const inv = getStorage('zahi_inventory', initialInventory);
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
  },
  add: async (data) => {
    const inv = getStorage('zahi_inventory', initialInventory);
    data.id = inv.length ? Math.max(...inv.map(i => i.id)) + 1 : 1;
    const newList = [data, ...inv];
    setStorage('zahi_inventory', newList);
    syncToCloud({ inventory: newList });
    return { data: { message: 'Success' } };
  },
  update: async (data) => {
    let inv = getStorage('zahi_inventory', initialInventory);
    inv = inv.map(i => i.id === data.id ? { ...i, ...data } : i);
    setStorage('zahi_inventory', inv);
    syncToCloud({ inventory: inv });
    return { data: { message: 'Success' } };
  },
  delete: async (id) => {
    let inv = getStorage('zahi_inventory', initialInventory);
    const newList = inv.filter(i => i.id !== id);
    setStorage('zahi_inventory', newList);
    syncToCloud({ inventory: newList });
    return { data: { message: 'Success' } };
  },
};

export const ordersAPI = {
  getAll: async () => {
    await pullFromCloud();
    return { data: getStorage('zahi_orders', initialOrders) };
  },
  getSummary: async (fromDate, toDate) => {
    await pullFromCloud();
    const orders = getStorage('zahi_orders', initialOrders);
    const inv = getStorage('zahi_inventory', initialInventory);
    const filteredOrders = orders.filter(o => {
      const d = new Date(o.order_date);
      return d >= new Date(fromDate) && d <= new Date(toDate);
    });
    return {
      data: {
        orders: {
          total_orders: filteredOrders.length,
          finished_orders: filteredOrders.filter(o => o.status === 'finished').length,
          total_revenue: filteredOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
        },
        inventory: { total_items: inv.length, items_to_buy: inv.filter(i => i.status === 'needs_purchase').length }
      }
    };
  },
  add: async (data) => {
    const orders = getStorage('zahi_orders', initialOrders);
    data.id = orders.length ? Math.max(...orders.map(i => i.id)) + 1 : 1;
    const newList = [data, ...orders];
    setStorage('zahi_orders', newList);
    syncToCloud({ orders: newList });
    return { data: { message: 'Success' } };
  },
  update: async (data) => {
    let orders = getStorage('zahi_orders', initialOrders);
    orders = orders.map(i => i.id === data.id ? { ...i, ...data } : i);
    setStorage('zahi_orders', orders);
    syncToCloud({ orders: orders });
    return { data: { message: 'Success' } };
  },
  delete: async (id) => {
    let orders = getStorage('zahi_orders', initialOrders);
    const newList = orders.filter(i => i.id !== id);
    setStorage('zahi_orders', newList);
    syncToCloud({ orders: newList });
    return { data: { message: 'Success' } };
  },
};

export const invoicesAPI = {
  getAll: async () => {
    await pullFromCloud();
    return { data: getStorage('zahi_invoices', initialInvoices) };
  },
  add: async (data) => {
    const invoices = getStorage('zahi_invoices', initialInvoices);
    data.id = invoices.length ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
    const orders = getStorage('zahi_orders', initialOrders);
    const order = orders.find(o => o.id == data.order_id);
    if (order) { data.customer_name = order.customer_name; data.description = order.description; }
    const newList = [data, ...invoices];
    setStorage('zahi_invoices', newList);
    syncToCloud({ invoices: newList });
    return { data: { message: 'Success' } };
  },
  update: async (data) => {
    let invoices = getStorage('zahi_invoices', initialInvoices);
    invoices = invoices.map(i => i.id === data.id ? { ...i, ...data } : i);
    setStorage('zahi_invoices', invoices);
    syncToCloud({ invoices: invoices });
    return { data: { message: 'Success' } };
  },
  delete: async (id) => {
    let invoices = getStorage('zahi_invoices', initialInvoices);
    const newList = invoices.filter(i => i.id !== id);
    setStorage('zahi_invoices', newList);
    syncToCloud({ invoices: newList });
    return { data: { message: 'Success' } };
  },
};

export const purchaseLogAPI = {
  getAll: async () => {
    await pullFromCloud();
    return { data: getStorage('zahi_purchase_log', initialPurchaseLog) };
  },
  add: async (data) => {
    const logs = getStorage('zahi_purchase_log', initialPurchaseLog);
    const newItem = {
      ...data,
      id: Date.now(),
      quantity: parseFloat(data.quantity || 0),
      price_per_unit: parseFloat(data.price_per_unit || 0),
      total_cost: parseFloat(data.quantity || 0) * parseFloat(data.price_per_unit || 0)
    };
    const newList = [newItem, ...logs];
    setStorage('zahi_purchase_log', newList);
    syncToCloud({ purchase_log: newList });
    return { data: { message: 'Success' } };
  },
  delete: async (id) => {
    let logs = getStorage('zahi_purchase_log', initialPurchaseLog);
    const newList = logs.filter(i => i.id !== id);
    setStorage('zahi_purchase_log', newList);
    syncToCloud({ purchase_log: newList });
    return { data: { message: 'Success' } };
  }
};
