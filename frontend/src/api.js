import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lzcdstjxmbacieahlbsf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6Y2RzdGp4bWJhY2llYWhsYnNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMTk0ODUsImV4cCI6MjEwNDg5NTQ4NX0.N3RwCcdsBybunPInbhvkQoc_mGtZquuvnV8F2CRHQus';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Setup Supabase Realtime listener
export const setupRealtimeSync = () => {
  supabase
    .channel('zahi_all_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
      window.dispatchEvent(new Event('zahi_data_updated'));
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      window.dispatchEvent(new Event('zahi_data_updated'));
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
      window.dispatchEvent(new Event('zahi_data_updated'));
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_log' }, () => {
      window.dispatchEvent(new Event('zahi_data_updated'));
    })
    .subscribe();
};

const notifyUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('zahi_data_updated'));
  }
};

const parseNum = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

const formatDate = (val) => {
  if (!val) return new Date().toISOString().split('T')[0];
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};

// ─── INVENTORY API ─────────────────────────────────────────────────────────────
export const inventoryAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('id', { ascending: false });
    if (error) throw error;
    return { data: data || [] };
  },

  getSummary: async (fromDate, toDate) => {
    const { data: inv, error } = await supabase.from('inventory').select('*');
    if (error) throw error;
    const filtered = (inv || []).filter(i => {
      if (!i.purchased_date) return false;
      return i.purchased_date >= fromDate && i.purchased_date <= toDate;
    });
    return {
      data: {
        inventory: {
          total_items: filtered.length,
          items_to_buy: filtered.filter(i => i.status === 'needs_purchase').length,
        },
      },
    };
  },

  add: async (item) => {
    const payload = {
      item_name: item.item_name || 'Unnamed Item',
      quantity: parseNum(item.quantity),
      unit: item.unit || 'pcs',
      price: parseNum(item.price),
      status: item.status || 'in_stock',
      purchased_date: formatDate(item.purchased_date)
    };
    const { data, error } = await supabase.from('inventory').insert([payload]).select();
    if (error) {
      console.error("Supabase insert inventory error:", error);
      throw error;
    }
    notifyUpdate();
    return { data: data?.[0] || { message: 'Success' } };
  },

  update: async (item) => {
    const payload = {
      item_name: item.item_name || 'Unnamed Item',
      quantity: parseNum(item.quantity),
      unit: item.unit || 'pcs',
      price: parseNum(item.price),
      status: item.status || 'in_stock',
      purchased_date: formatDate(item.purchased_date)
    };
    const { data, error } = await supabase.from('inventory').update(payload).eq('id', item.id).select();
    if (error) {
      console.error("Supabase update inventory error:", error);
      throw error;
    }
    notifyUpdate();
    return { data: data?.[0] || { message: 'Success' } };
  },

  delete: async (id) => {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) {
      console.error("Supabase delete inventory error:", error);
      throw error;
    }
    notifyUpdate();
    return { data: { message: 'Success' } };
  },
};

// ─── ORDERS API ────────────────────────────────────────────────────────────────
export const ordersAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('id', { ascending: false });
    if (error) throw error;
    return { data: data || [] };
  },

  getSummary: async (fromDate, toDate) => {
    const { data: orders, error: errOrders } = await supabase.from('orders').select('*');
    if (errOrders) throw errOrders;
    const { data: inv, error: errInv } = await supabase.from('inventory').select('*');
    if (errInv) throw errInv;

    const filtered = (orders || []).filter(o => {
      if (!o.order_date) return true;
      if (fromDate && o.order_date < fromDate) return false;
      if (toDate && o.order_date > toDate) return false;
      return true;
    });

    return {
      data: {
        orders: {
          total_orders: filtered.length,
          finished_orders: filtered.filter(o => o.status === 'finished').length,
          total_revenue: filtered.reduce((s, o) => s + parseNum(o.total_amount), 0),
        },
        inventory: {
          total_items: (inv || []).length,
          items_to_buy: (inv || []).filter(i => i.status === 'needs_purchase').length,
        },
      },
    };
  },

  add: async (item) => {
    const payload = {
      customer_name: item.customer_name || 'Customer',
      description: item.description || '',
      total_amount: parseNum(item.total_amount),
      status: item.status || 'pending',
      order_date: formatDate(item.order_date)
    };
    const { data, error } = await supabase.from('orders').insert([payload]).select();
    if (error) {
      console.error("Supabase insert order error:", error);
      throw error;
    }
    notifyUpdate();
    return { data: data?.[0] || { message: 'Success' } };
  },

  update: async (item) => {
    const payload = {
      customer_name: item.customer_name || 'Customer',
      description: item.description || '',
      total_amount: parseNum(item.total_amount),
      status: item.status || 'pending',
      order_date: formatDate(item.order_date)
    };
    const { data, error } = await supabase.from('orders').update(payload).eq('id', item.id).select();
    if (error) {
      console.error("Supabase update order error:", error);
      throw error;
    }
    notifyUpdate();
    return { data: data?.[0] || { message: 'Success' } };
  },

  delete: async (id) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      console.error("Supabase delete order error:", error);
      throw error;
    }
    notifyUpdate();
    return { data: { message: 'Success' } };
  },
};

// ─── INVOICES API ──────────────────────────────────────────────────────────────
export const invoicesAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('id', { ascending: false });
    if (error) throw error;
    return { data: data || [] };
  },

  add: async (item) => {
    let customerName = item.customer_name || '';
    let description = item.description || '';

    const orderId = item.order_id ? parseInt(item.order_id) : null;
    if (orderId && (!customerName || !description)) {
      const { data: order } = await supabase
        .from('orders')
        .select('customer_name, description')
        .eq('id', orderId)
        .single();
      if (order) {
        if (!customerName) customerName = order.customer_name;
        if (!description) description = order.description;
      }
    }

    const payload = {
      order_id: orderId,
      customer_name: customerName,
      description: description,
      invoice_date: formatDate(item.invoice_date || item.date),
      amount: parseNum(item.amount),
      payment_type: item.payment_type || 'full',
      advance_amount: parseNum(item.advance_amount),
      status: item.status || 'unpaid'
    };
    const { data, error } = await supabase.from('invoices').insert([payload]).select();
    if (error) {
      console.error("Supabase insert invoice error:", error);
      throw error;
    }
    notifyUpdate();
    return { data: data?.[0] || { message: 'Success' } };
  },

  update: async (item) => {
    const payload = {};
    if (item.status !== undefined) payload.status = item.status;
    if (item.customer_name !== undefined) payload.customer_name = item.customer_name;
    if (item.description !== undefined) payload.description = item.description;
    if (item.amount !== undefined) payload.amount = parseNum(item.amount);
    if (item.payment_type !== undefined) payload.payment_type = item.payment_type;
    if (item.advance_amount !== undefined) payload.advance_amount = parseNum(item.advance_amount);
    if (item.invoice_date || item.date) payload.invoice_date = formatDate(item.invoice_date || item.date);

    const { data, error } = await supabase.from('invoices').update(payload).eq('id', item.id).select();
    if (error) {
      console.error("Supabase update invoice error:", error);
      throw error;
    }
    notifyUpdate();
    return { data: data?.[0] || { message: 'Success' } };
  },

  delete: async (id) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) {
      console.error("Supabase delete invoice error:", error);
      throw error;
    }
    notifyUpdate();
    return { data: { message: 'Success' } };
  },
};

// ─── PURCHASE LOG API (Item Summary) ──────────────────────────────────────────
export const purchaseLogAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('purchase_log')
      .select('*')
      .order('id', { ascending: false });
    if (error) throw error;
    return { data: data || [] };
  },

  add: async (item) => {
    const qty = parseNum(item.quantity);
    const price = parseNum(item.price_per_unit);
    const payload = {
      item_name: item.item_name || 'Purchased Item',
      quantity: qty,
      unit: item.unit || 'pcs',
      price_per_unit: price,
      total_cost: qty * price,
      purchased_date: formatDate(item.purchased_date || item.date),
      notes: item.notes || ''
    };
    const { data, error } = await supabase.from('purchase_log').insert([payload]).select();
    if (error) {
      console.error("Supabase insert purchase_log error:", error);
      throw error;
    }
    notifyUpdate();
    return { data: data?.[0] || { message: 'Success' } };
  },

  delete: async (id) => {
    const { error } = await supabase.from('purchase_log').delete().eq('id', id);
    if (error) {
      console.error("Supabase delete purchase_log error:", error);
      throw error;
    }
    notifyUpdate();
    return { data: { message: 'Success' } };
  },
};
