import { useState, useEffect } from 'react';
import { inventoryAPI } from '../api';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle, XCircle, ShoppingCart, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function InventoryTable({ title, items, icon, headerColor, badgeEl, onEdit, onDelete, emptyMsg, onDownloadPDF }) {
  return (
    <div className="card overflow-hidden p-0">
      {/* Table Header */}
      <div className={`px-6 py-4 flex items-center justify-between ${headerColor}`}>
        <div className="flex items-center space-x-3">
          {icon}
          <div>
            <h2 className="font-bold text-lg">{title}</h2>
            <p className="text-sm opacity-75">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {onDownloadPDF && items.length > 0 && (
          <button onClick={onDownloadPDF}
            className="flex items-center gap-1 bg-white/80 hover:bg-white text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all">
            <FileDown className="w-3.5 h-3.5" /> PDF
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr>
              <th className="table-header">Item Name</th>
              <th className="table-header">Quantity</th>
              <th className="table-header">Price (LKR)</th>
              <th className="table-header">Date</th>
              <th className="table-header">Status</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400 italic">{emptyMsg}</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="table-cell font-medium text-slate-900">{item.item_name}</td>
                  <td className="table-cell">{item.quantity} {item.unit}</td>
                  <td className="table-cell">LKR {parseFloat(item.price || 0).toLocaleString()}</td>
                  <td className="table-cell">{item.purchased_date ? new Date(item.purchased_date).toLocaleDateString() : '-'}</td>
                  <td className="table-cell">{badgeEl}</td>
                  <td className="table-cell text-right space-x-2">
                    <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null, item_name: '', quantity: '', unit: 'pcs',
    price: '', status: 'in_stock', purchased_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { 
    fetchInventory(); 
    window.addEventListener('zahi_data_updated', fetchInventory);
    return () => window.removeEventListener('zahi_data_updated', fetchInventory);
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await inventoryAPI.getAll();
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await inventoryAPI.update(formData);
      } else {
        await inventoryAPI.add(formData);
      }
      setIsModalOpen(false);
      fetchInventory();
    } catch (error) {
      console.error("Error saving inventory item:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await inventoryAPI.delete(id);
        fetchInventory();
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({ id: null, item_name: '', quantity: '', unit: 'pcs', price: '', status: 'in_stock', purchased_date: new Date().toISOString().split('T')[0] });
    }
    setIsModalOpen(true);
  };

  const inStockItems = items.filter(i => i.status === 'in_stock' && parseFloat(i.quantity) > 0);
  const outOfStockItems = items.filter(i => i.status === 'in_stock' && parseFloat(i.quantity) <= 0);
  const needsPurchaseItems = items.filter(i => i.status === 'needs_purchase');

  const downloadNeedsPurchasePDF = () => {
    const doc = new jsPDF();

    // Background
    doc.setFillColor(253, 251, 235);
    doc.rect(0, 0, 210, 297, 'F');

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text('NEEDS PURCHASE LIST', 14, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 30);
    doc.text('Zahi Wood Work', 14, 36);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Total items to purchase: ${needsPurchaseItems.length}`, 14, 46);

    autoTable(doc, {
      startY: 54,
      head: [['#', 'Item Name', 'Quantity Needed', 'Unit']],
      body: needsPurchaseItems.map((item, i) => [
        i + 1,
        item.item_name,
        item.quantity,
        item.unit
      ]),
      theme: 'plain',
      headStyles: { textColor: [146, 64, 14], fontStyle: 'bold', fontSize: 10 },
      styles: { fontSize: 10, cellPadding: 4, textColor: [30, 41, 59] },
      columnStyles: { 0: { halign: 'center', cellWidth: 10 } },
      didParseCell: (data) => {
        if (data.section === 'body') {
          data.cell.styles.fillColor = data.row.index % 2 === 0 ? [255, 255, 255] : [253, 251, 235];
        }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFillColor(146, 64, 14);
    doc.rect(14, finalY, 182, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`TOTAL ITEMS TO BUY: ${needsPurchaseItems.length}`, 16, finalY + 7);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Zahi Wood Work Management System', 14, 285);

    doc.save(`Needs_Purchase_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory</h1>
          <p className="text-slate-500 mt-1">Manage your materials and tools.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-emerald-600 font-medium">In Stock</p>
            <p className="text-2xl font-bold text-emerald-800">{inStockItems.length}</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-red-600 font-medium">Out of Stock</p>
            <p className="text-2xl font-bold text-red-800">{outOfStockItems.length}</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center space-x-4">
          <div className="p-3 bg-amber-100 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-amber-600 font-medium">Needs Purchase</p>
            <p className="text-2xl font-bold text-amber-800">{needsPurchaseItems.length}</p>
          </div>
        </div>
      </div>

      {/* In Stock Table */}
      <InventoryTable
        title="In Stock"
        items={inStockItems}
        icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}
        headerColor="bg-emerald-50 text-emerald-800"
        badgeEl={<span className="badge-success">In Stock</span>}
        onEdit={openModal}
        onDelete={handleDelete}
        emptyMsg="No items in stock."
      />

      {/* Out of Stock Table */}
      <InventoryTable
        title="Out of Stock"
        items={outOfStockItems}
        icon={<XCircle className="w-6 h-6 text-red-600" />}
        headerColor="bg-red-50 text-red-800"
        badgeEl={<span className="badge-danger">Out of Stock</span>}
        onEdit={openModal}
        onDelete={handleDelete}
        emptyMsg="No items are out of stock."
      />

      {/* Needs Purchase Table */}
      <InventoryTable
        title="Needs Purchase"
        items={needsPurchaseItems}
        icon={<ShoppingCart className="w-6 h-6 text-amber-600" />}
        headerColor="bg-amber-50 text-amber-800"
        badgeEl={<span className="badge-warning flex items-center w-max"><AlertCircle className="w-3 h-3 mr-1"/>Needs Purchase</span>}
        onEdit={openModal}
        onDelete={handleDelete}
        emptyMsg="No items need to be purchased."
        onDownloadPDF={downloadNeedsPurchasePDF}
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">{formData.id ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                <input required type="text" className="input-field" value={formData.item_name} onChange={(e) => setFormData({...formData, item_name: e.target.value})} placeholder="e.g. Plywood 18mm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input required type="number" className="input-field" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <select className="input-field" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}>
                    <option value="pcs">Pcs</option>
                    <option value="sheets">Sheets</option>
                    <option value="cft">Cubic Feet</option>
                    <option value="kg">Kg</option>
                    <option value="bottles">Bottles</option>
                    <option value="meters">Meters</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (LKR)</label>
                <input required type="number" className="input-field" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="e.g. 1500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select className="input-field" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="in_stock">In Stock</option>
                    <option value="needs_purchase">Needs Purchase</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Purchased Date</label>
                  <input type="date" className="input-field" value={formData.purchased_date || ''} onChange={(e) => setFormData({...formData, purchased_date: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
