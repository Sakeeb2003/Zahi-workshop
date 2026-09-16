import { useState, useEffect } from 'react';
import { invoicesAPI, ordersAPI } from '../api';
import { Plus, Printer, Trash2, CheckCircle, FileText, Download, Search, CreditCard, Edit2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Invoices() {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, 
    order_id: '', 
    invoice_date: new Date().toISOString().split('T')[0], 
    amount: '', 
    payment_type: 'full', 
    advance_amount: '', 
    status: 'unpaid' 
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
    window.addEventListener('zahi_data_updated', fetchData);
    return () => window.removeEventListener('zahi_data_updated', fetchData);
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
      setOrders(safeOrd); // Include all orders (pending & finished)
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
    const primaryBrown = [115, 67, 32];   // Dark warm wood brown #734320
    const textBrown    = [92, 58, 33];    // Rich wood text #5C3A21
    const bgCream      = [248, 243, 236]; // Off-white warm paper #F8F3EC
    const lightLine    = [215, 200, 185]; // Warm beige grid lines

    // 1. Top Header Banner Bar (Wood Plank style)
    doc.setFillColor(...primaryBrown);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("INVOICE", 105, 9, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(235, 215, 195);
    doc.text("Zahi Wood Work Carpenter Solutions", 105, 15, { align: 'center' });

    // 2. Main Page Background Fill & Outer Frame
    doc.setFillColor(...bgCream);
    doc.rect(0, 20, 210, 277, 'F');

    // 3. Header Section (Invoice Title & Logo)
    doc.setFont("serif", "bold");
    doc.setFontSize(28);
    doc.setTextColor(...textBrown);
    doc.text("Invoice", 14, 38);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("ZAHI WOOD WORK", 196, 35, { align: 'right' });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 105, 75);
    doc.text("WOOD SOLUTIONS & CUSTOM CARPENTRY", 196, 40, { align: 'right' });

    // 4. "Bill to" Section with Underline
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...textBrown);
    doc.text("Bill to", 14, 52);
    doc.setDrawColor(...primaryBrown);
    doc.setLineWidth(0.6);
    doc.line(14, 54, 38, 54);

    // Bill to fields in 4 columns
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(130, 95, 65);
    doc.text("Client Name", 14, 62);
    doc.text("Invoice No", 65, 62);
    doc.text("Order Ref", 115, 62);
    doc.text("Date", 160, 62);

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 30, 20);
    const invNumStr = `INV-${invoice.id.toString().padStart(4, '0')}`;
    const orderRefStr = invoice.order_id ? `Order #${invoice.order_id}` : 'Direct Order';
    const dateStr = invoice.invoice_date ? new Date(invoice.invoice_date.toString().replace(/-/g, '/')).toLocaleDateString('en-GB') : '-';
    
    doc.text(invoice.customer_name || 'Valued Customer', 14, 67);
    doc.text(invNumStr, 65, 67);
    doc.text(orderRefStr, 115, 67);
    doc.text(dateStr, 160, 67);

    // Thin separator under client details
    doc.setDrawColor(...lightLine);
    doc.setLineWidth(0.4);
    doc.line(14, 71, 196, 71);

    // 5. Wood Grain Ring Watermark (Concentric Circles in Center Background)
    doc.setDrawColor(230, 218, 204);
    doc.setLineWidth(0.3);
    for (let r = 10; r <= 55; r += 5) {
      doc.circle(105, 145, r);
    }

    // 6. Itemized Table
    const totalVal = parseFloat(invoice.amount || 0);
    const advVal   = invoice.payment_type === 'advance' ? parseFloat(invoice.advance_amount || 0) : 0;
    const balVal   = Math.max(0, totalVal - advVal);

    autoTable(doc, {
      startY: 76,
      head: [['Qty', 'Item', 'Description', 'Unit', 'Total (LKR)']],
      body: [
        [
          '1',
          'Woodwork',
          invoice.description || 'Custom Furniture & Carpentry Services',
          'Pcs',
          `LKR ${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        ],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
      ],
      theme: 'grid',
      headStyles: {
        fillColor: primaryBrown,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
        valign: 'middle',
        cellPadding: 3
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 3.5,
        textColor: [40, 30, 20],
        lineColor: lightLine,
        lineWidth: 0.25,
        fillColor: [255, 255, 255]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 14 },
        1: { halign: 'left', cellWidth: 32, fontStyle: 'bold' },
        2: { halign: 'left', cellWidth: 80 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'right', cellWidth: 36, fontStyle: 'bold' }
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          // Transparent / cream row fill
          data.cell.styles.fillColor = data.row.index % 2 === 0 ? [255, 255, 255] : [250, 245, 238];
        }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 4;

    // 7. Notes & Summary Totals Box
    // Left: Notes section
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textBrown);
    doc.text("Notes:", 14, finalY + 4);
    doc.setLineWidth(0.3);
    doc.setDrawColor(...lightLine);
    doc.line(14, finalY + 6, 110, finalY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 75, 60);
    doc.text("All carpentry items crafted with premium timber & quality finishes.", 14, finalY + 11);

    // Right: Totals block
    const sumX = 125;
    const sumW = 71;
    let currY = finalY;

    // Subtotal row
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 60, 45);
    doc.text("Subtotal", sumX, currY + 4);
    doc.text(`LKR ${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 196, currY + 4, { align: 'right' });
    currY += 7;

    if (invoice.payment_type === 'advance' && advVal > 0) {
      doc.text("Advance Paid", sumX, currY + 4);
      doc.text(`LKR ${advVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 196, currY + 4, { align: 'right' });
      currY += 7;

      // Balance Bar
      doc.setFillColor(...primaryBrown);
      doc.rect(sumX - 2, currY + 1, sumW + 4, 8, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("Balance Due", sumX, currY + 6);
      doc.text(`LKR ${balVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 196, currY + 6, { align: 'right' });
    } else {
      // Total Bar
      doc.setFillColor(...primaryBrown);
      doc.rect(sumX - 2, currY + 1, sumW + 4, 8, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("Total", sumX, currY + 6);
      doc.text(`LKR ${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 196, currY + 6, { align: 'right' });
    }

    // 8. Signature Section (4 Underline Fields)
    const sigY = 245;
    doc.setDrawColor(...lightLine);
    doc.setLineWidth(0.4);

    doc.line(14, sigY, 52, sigY);
    doc.line(62, sigY, 100, sigY);
    doc.line(110, sigY, 148, sigY);
    doc.line(158, sigY, 196, sigY);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 90, 65);
    doc.text("Signature", 33, sigY + 4, { align: 'center' });
    doc.text("Name", 81, sigY + 4, { align: 'center' });
    doc.text("Date", 129, sigY + 4, { align: 'center' });
    doc.text("Payment", 177, sigY + 4, { align: 'center' });

    // 9. Terms & Conditions Footer
    const footerY = 262;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textBrown);
    doc.text("Terms & Conditions", 14, footerY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(110, 90, 70);
    const terms = "Thank you for choosing Zahi Wood Work. Quality craftsmanship guaranteed. All custom woodwork and carpentry items are thoroughly inspected prior to delivery.";
    const splitTerms = doc.splitTextToSize(terms, 182);
    doc.text(splitTerms, 14, footerY + 4);

    // Save PDF
    doc.save(`Invoice_${invNumStr}_${(invoice.customer_name || 'Customer').replace(/\s+/g, '_')}.pdf`);
  };

  const openModal = (item = null) => {
    if (item) {
      setFormData({
        id: item.id,
        order_id: item.order_id || '',
        customer_name: item.customer_name || '',
        description: item.description || '',
        invoice_date: item.invoice_date || new Date().toISOString().split('T')[0],
        amount: item.amount || '',
        payment_type: item.payment_type || 'full',
        advance_amount: item.advance_amount || '',
        status: item.status || 'unpaid'
      });
    } else {
      const firstOrder = orders.length > 0 ? orders[0] : null;
      setFormData({ 
        id: null, 
        order_id: firstOrder ? firstOrder.id : '', 
        customer_name: firstOrder ? firstOrder.customer_name : '',
        description: firstOrder ? firstOrder.description : '',
        invoice_date: new Date().toISOString().split('T')[0], 
        amount: firstOrder ? firstOrder.total_amount : '',
        payment_type: 'full',
        advance_amount: '',
        status: 'unpaid' 
      });
    }
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
                <th className="table-header">Payment Summary</th>
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
                ).map((item) => {
                  const total = parseFloat(item.amount || 0);
                  const adv = item.payment_type === 'advance' ? parseFloat(item.advance_amount || 0) : 0;
                  const bal = Math.max(0, total - adv);

                  return (
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
                      <td className="table-cell">{item.invoice_date ? new Date(item.invoice_date.toString().replace(/-/g, '/')).toLocaleDateString() : '-'}</td>
                      <td className="table-cell">
                        <div className="font-semibold text-slate-900">Total: LKR {total.toLocaleString()}</div>
                        {item.payment_type === 'advance' ? (
                          <div className="text-xs space-y-0.5 mt-0.5">
                            <span className="text-emerald-700 font-medium mr-2">Adv: LKR {adv.toLocaleString()}</span>
                            <span className="text-amber-700 font-bold">Bal: LKR {bal.toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Full Payment</span>
                        )}
                      </td>
                      <td className="table-cell">
                        {item.status === 'paid' ? (
                          <span className="badge-success">Paid</span>
                        ) : (
                          <span className="badge-warning">Unpaid</span>
                        )}
                      </td>
                      <td className="table-cell text-right space-x-2">
                        <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-800 p-1" title="Edit Invoice">
                          <Edit2 className="w-4 h-4" />
                        </button>
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
                  );
                })
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
              <h3 className="text-lg font-semibold text-slate-900">{formData.id ? 'Edit Invoice' : 'New Invoice'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {orders.length === 0 ? (
                <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                  No orders found. Please create an order first.
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Order (Pending or Finished)</label>
                    <select required className="input-field" value={formData.order_id} onChange={handleOrderChange}>
                      <option value="" disabled>Select an order...</option>
                      {orders.map(o => (
                        <option key={o.id} value={o.id}>
                          {o.customer_name} - LKR {parseFloat(o.total_amount || 0).toLocaleString()} ({o.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Date</label>
                      <input required type="date" className="input-field" value={formData.invoice_date} onChange={(e) => setFormData({...formData, invoice_date: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount (LKR)</label>
                      <input required type="number" step="0.01" className="input-field" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Type</label>
                    <select 
                      className="input-field" 
                      value={formData.payment_type} 
                      onChange={(e) => setFormData({
                        ...formData, 
                        payment_type: e.target.value,
                        advance_amount: e.target.value === 'full' ? '' : formData.advance_amount
                      })}
                    >
                      <option value="full">Full Payment</option>
                      <option value="advance">Advance Payment</option>
                    </select>
                  </div>

                  {formData.payment_type === 'advance' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Advance Amount Paid (LKR)</label>
                      <input 
                        required 
                        type="number" 
                        step="0.01" 
                        placeholder="e.g. 5000"
                        className="input-field" 
                        value={formData.advance_amount} 
                        onChange={(e) => setFormData({...formData, advance_amount: e.target.value})} 
                      />
                      {formData.amount && formData.advance_amount && (
                        <div className="mt-2 text-xs p-2 bg-amber-50 rounded text-amber-800 flex justify-between font-medium">
                          <span>Balance Remaining:</span>
                          <span className="font-bold">
                            LKR {Math.max(0, parseFloat(formData.amount || 0) - parseFloat(formData.advance_amount || 0)).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

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
                <button type="submit" disabled={orders.length === 0} className="btn-primary">{formData.id ? 'Update Invoice' : 'Generate Invoice'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
