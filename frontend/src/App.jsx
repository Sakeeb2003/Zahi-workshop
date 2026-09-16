import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FileText, Menu, X, ClipboardList } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';
import ItemSummary from './pages/ItemSummary';
import { setupRealtimeSync } from './api';

function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/item-summary', label: 'Item Summary', icon: ClipboardList },
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/invoices', label: 'Invoices', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 text-white min-h-screen flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Zahi Wood Work</h1>
            <p className="text-slate-400 text-sm mt-1">Management System</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 text-xs text-slate-500 border-t border-slate-800">
          &copy; 2026 Carpenter System
        </div>
      </aside>
    </>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setupRealtimeSync();
  }, []);

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Mobile Header */}
          <header className="lg:hidden bg-slate-900 text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md z-30 sticky top-0">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-2 -ml-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg active:bg-slate-700 transition-colors"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="font-bold text-white text-base tracking-tight leading-none">Zahi Wood Work</h1>
                <p className="text-slate-400 text-[11px] mt-0.5">Management System</p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/item-summary" element={<ItemSummary />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/invoices" element={<Invoices />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
