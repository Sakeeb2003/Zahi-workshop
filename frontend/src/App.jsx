import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FileText, Menu, X, ClipboardList, Camera, Upload, RotateCcw } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';
import ItemSummary from './pages/ItemSummary';
import { setupRealtimeSync } from './api';

function Sidebar({ isOpen, setIsOpen, logoUrl, onOpenLogoModal }) {
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
        <div className="p-6 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onOpenLogoModal}
              title="Click to Change Logo / Profile Photo"
              className="relative group w-12 h-12 rounded-full bg-[#F6F4F0] border-2 border-amber-500/80 flex items-center justify-center overflow-hidden p-0.5 shadow-md hover:ring-2 hover:ring-amber-400 transition-all cursor-pointer"
            >
              <img src={logoUrl} alt="Zahi Logo" className="w-full h-full object-contain rounded-full" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </button>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-tight">
                <span className="text-amber-500 font-extrabold tracking-wide text-lg block">Zahi Abdullah</span>
                <span className="text-xs text-amber-100/80 font-medium tracking-wider uppercase">Home Designing</span>
              </h1>
            </div>
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
        <div className="p-4 text-xs text-slate-400 border-t border-slate-800 flex justify-between items-center">
          <span>&copy; 2026 Zahi Abdullah</span>
          <button 
            onClick={onOpenLogoModal}
            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px] underline font-medium"
          >
            <Camera className="w-3.5 h-3.5" /> Change Photo
          </button>
        </div>
      </aside>
    </>
  );
}

// Logo & Profile Photo Change Modal Component
function LogoUploadModal({ isOpen, onClose, currentLogo, onSaveLogo, onResetLogo }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (selectedImage) {
      onSaveLogo(selectedImage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-600" /> Change Profile / Logo Photo
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 flex flex-col items-center">
          <div className="w-28 h-28 rounded-full bg-[#F6F4F0] border-4 border-amber-500 shadow-md flex items-center justify-center overflow-hidden mb-4 p-1">
            <img 
              src={selectedImage || currentLogo} 
              alt="Profile Preview" 
              className="w-full h-full object-contain rounded-full" 
            />
          </div>
          <p className="text-sm text-slate-500 text-center mb-4">
            Upload your logo or profile photo to customize your dashboard and sidebar.
          </p>

          <label className="cursor-pointer bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Choose New Image
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        <div className="flex items-center justify-between border-t pt-4 gap-2">
          <button
            onClick={() => {
              onResetLogo();
              setSelectedImage(null);
              onClose();
            }}
            className="text-slate-500 hover:text-red-600 text-xs font-medium flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedImage}
              className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow transition-colors ${
                selectedImage ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              Save Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(localStorage.getItem('zahi_custom_logo') || '/logo.png');
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  useEffect(() => {
    setupRealtimeSync();
  }, []);

  const handleSaveLogo = (newLogo) => {
    setLogoUrl(newLogo);
    localStorage.setItem('zahi_custom_logo', newLogo);
  };

  const handleResetLogo = () => {
    setLogoUrl('/logo.png');
    localStorage.removeItem('zahi_custom_logo');
  };

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
          logoUrl={logoUrl}
          onOpenLogoModal={() => setIsLogoModalOpen(true)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Mobile & Tablet Header */}
          <header className="lg:hidden bg-slate-900 text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md z-30 sticky top-0">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-2 -ml-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg active:bg-slate-700 transition-colors"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div 
                onClick={() => setIsLogoModalOpen(true)}
                className="flex items-center space-x-2.5 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-[#F6F4F0] border-2 border-amber-500/70 flex items-center justify-center p-0.5 overflow-hidden shadow-sm">
                  <img src={logoUrl} alt="Zahi Logo" className="w-full h-full object-contain rounded-full" />
                </div>
                <div>
                  <h1 className="font-bold text-white text-base tracking-tight leading-none">
                    <span className="text-amber-500 font-extrabold">Zahi Abdullah</span>
                  </h1>
                  <p className="text-slate-300 text-[11px] mt-0.5 font-medium tracking-wide uppercase">Home Designing</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsLogoModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Change Profile Photo"
            >
              <Camera className="w-5 h-5" />
            </button>
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

        {/* Profile / Logo Upload Modal */}
        <LogoUploadModal 
          isOpen={isLogoModalOpen}
          onClose={() => setIsLogoModalOpen(false)}
          currentLogo={logoUrl}
          onSaveLogo={handleSaveLogo}
          onResetLogo={handleResetLogo}
        />
      </div>
    </Router>
  );
}

export default App;
