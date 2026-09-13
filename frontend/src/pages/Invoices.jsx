import { useState, useEffect } from 'react';
import { invoicesAPI, ordersAPI } from '../api';
import { Plus, Printer, Trash2, CheckCircle, FileText, Download, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Invoices() {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, order_id: '', invoice_date: new Date().toISOString().split('T')[0], amount: '', status: 'unpaid' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invRes, ordRes] = await Promise.all([
        invoicesAPI.getAll(),
        ordersAPI.getAll()
      ]);
      const safeInv = Array.isArray(invRes.data) ? invRes.data : [];
      const safeOrd = Array.isArray(ordRes.data) ? ordRes.data : [];
      setItems(safeInv);
      setOrders(safeOrd);
    } catch (error) {
      console.error("Error fetching data:", error);
      setItems([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderChange = (e) => {
    const orderId = e.target.value;
    const selectedOrder = orders.find(o => o.id == orderId);
    setFormData({
      ...formData,
      order_id: orderId,
      amount: selectedOrder ? selectedOrder.total_amount : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await invoicesAPI.update(formData);
      } else {
        await invoicesAPI.add(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await invoicesAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error("Error deleting invoice:", error);
      }
    }
  };
  
  const handlePrint = (invoice) => {
    const doc = new jsPDF();
    
    // Background color (Cream)
    doc.setFillColor(253, 246, 237);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Colors
    const primaryColor = [181, 65, 23]; // Orange/Brown
    const textColor = [30, 41, 59]; // Dark Slate
    
    // Header
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("INVOICE", 14, 30);
    
    // Invoice Number (Right aligned)
    doc.setFontSize(14);
    const invNum = `INV-${invoice.id.toString().padStart(3, '0')}`;
    const invNumWidth = doc.getStringUnitWidth(invNum) * 14 / doc.internal.scaleFactor;
    doc.text(invNum, 210 - 14 - invNumWidth, 30);
    
    // From / Bill To section
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("FROM", 14, 60);
    doc.text("BILL TO", 120, 60);
    
    doc.setFontSize(14);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("Zahi Wood Work", 14, 68);
    doc.text(invoice.customer_name, 120, 68);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Main Street, Local Area", 14, 75);
    doc.text("Customer Address", 120, 75);
    
    // Table
    const tableAmount = parseFloat(invoice.amount).toLocaleString();
    autoTable(doc, {
      startY: 95,
      head: [['Description', 'Qty', 'Amount']],
      body: [
        [invoice.description || 'Woodworking Services', '1', `LKR ${tableAmount}`]
      ],
      theme: 'plain',
      headStyles: { 
        textColor: primaryColor, 
        fontStyle: 'bold',
        fontSize: 11
      },
      styles: { 
        fontSize: 11, 
        cellPadding: 4,
        textColor: textColor
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' }
      },
      didDrawPage: (data) => {
        // Draw top and bottom borders for header
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(0.5);
        doc.line(data.settings.margin.left, 95, 210 - data.settings.margin.right, 95);
        doc.line(data.settings.margin.left, 103, 210 - data.settings.margin.right, 103);
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          // White background for rows
          if (data.row.index % 2 === 0) {
            data.cell.styles.fillColor = [255, 255, 255];
          } else {
            data.cell.styles.fillColor = [253, 246, 237];
          }
        }
      }
    });
    
    // Draw row bottom borders (subtle)
    const finalY = doc.lastAutoTable.finalY;
    doc.setDrawColor(230, 230, 230);
    doc.line(14, finalY, 196, finalY);
    
    // Total Bar
    const barY = finalY + 15;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(14, barY, 182, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL", 16, barY + 7);
    
    const totalText = `LKR ${tableAmount}`;
    const totalWidth = doc.getStringUnitWidth(totalText) * 12 / doc.internal.scaleFactor;
    doc.text(totalText, 196 - totalWidth, barY + 7);
    
    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Thank you for your business!", 14, 280);
    
    doc.save(`Invoice_${invoice.id}_${invoice.customer_name.replace(/\s+/g, '_')}.pdf`);
  };

  const openModal = () => {
    setFormData({ id: null, order_id: orders.length > 0 ? orders[0].id : '', invoice_date: new Date().toISOString().split('T')[0], amount: orders.length > 0 ? orders[0].total_amount : '', status: 'unpaid' });
    setIsModalOpen(true);
  };
  
  const markAsPaid = async (item) => {
    try {
      await invoicesAPI.update({ id: item.id, status: 'paid' });
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Invoices</h1>
          <p className="text-slate-500 mt-1">Generate and track customer invoices.</p>
        </div>
        <div className="flex space-x-3 items-center">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-field min-w-[250px]"
            />
          </div>
          <button onClick={openModal} className="btn-primary flex items-center whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" /> New Invoice
          </button>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Invoice ID</th>
                <th className="table-header">Customer & Order</th>
                <th className="table-header">Date</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-slate-500">Loading...</td></tr>
              ) : items.filter(item => 
                  item.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  `INV-${item.id.toString().padStart(4, '0')}`.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-slate-500">No invoices found.</td></tr>
              ) : (
                items.filter(item => 
                  item.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  `INV-${item.id.toString().padStart(4, '0')}`.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-cell font-medium text-slate-900">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-slate-400 mr-2" />
                        INV-{item.id.toString().padStart(4, '0')}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium text-slate-900">{item.customer_name}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">{item.description}</div>
                    </td>
                    <td className="table-cell">{new Date(item.invoice_date).toLocaleDateString()}</td>
                    <td className="table-cell font-semibold text-slate-900">LKR {parseFloat(item.amount).toLocaleString()}</td>
                    <td className="table-cell">
                      {item.status === 'paid' ? (
                        <span className="badge-success">Paid</span>
                      ) : (
                        <span className="badge-warning">Unpaid</span>
                      )}
                    </td>
                    <td className="table-cell text-right space-x-2">
                       {item.status === 'unpaid' && (
                         <button onClick={() => markAsPaid(item)} className="text-green-600 hover:text-green-800 p-1" title="Mark as Paid">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                       )}
                      <button onClick={() => handlePrint(item)} className="text-blue-600 hover:text-blue-800 p-1" title="Download PDF">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 p-1" title="Delete">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">New Invoice</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {orders.length === 0 ? (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  You need to have at least one 'Finished' order to create an invoice.
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Order</label>
                    <select required className="input-field" value={formData.order_id} onChange={handleOrderChange}>
                      <option value="" disabled>Select a finished order...</option>
                      {orders.map(o => (
                        <option key={o.id} value={o.id}>{o.customer_name} - LKR {o.total_amount}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                      <input required type="date" className="input-field" value={formData.invoice_date} onChange={(e) => setFormData({...formData, invoice_date: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Amount (LKR)</label>
                      <input required type="number" step="0.01" className="input-field" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select className="input-field" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </>
              )}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={orders.length === 0} className="btn-primary">Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
