import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FileText, Menu, X, ClipboardList, Camera, Upload, RotateCcw, Download, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';
import ItemSummary from './pages/ItemSummary';
import { setupRealtimeSync } from './api';

function Sidebar({ isOpen, setIsOpen, logoUrl, onOpenLogoModal, onInstallApp }) {
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

        {/* Always visible Yellow Install Button in Sidebar */}
        <div className="px-4 pt-4">
          <button
            onClick={onInstallApp}
            className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold px-3 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all transform active:scale-95 border border-amber-400"
          >
            <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            Install Mobile App
          </button>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-2">
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

// Modal for clear visual App Installation Instructions (Android & iOS)
function InstallGuideModal({ isOpen, onClose, logoUrl }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-500" />
            Install Zahi Mobile App
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="flex items-center space-x-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
            <div className="w-12 h-12 rounded-full bg-[#F6F4F0] border-2 border-amber-500 flex items-center justify-center overflow-hidden p-0.5 flex-shrink-0">
              <img src={logoUrl} alt="App Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Zahi Abdullah Home Designing</h4>
              <p className="text-xs text-amber-800">Install to phone homescreen for 1-tap fast access!</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="border rounded-xl p-3 bg-slate-50">
              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Android (Google Chrome):
              </h5>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside font-medium">
                <li>Tap 3 dots <span className="font-bold text-slate-900 text-sm">⋮</span> in top right corner.</li>
                <li>Tap <span className="font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">Install App</span> or <span className="font-bold text-slate-900">Add to Home screen</span>.</li>
                <li>Confirm <span className="font-bold text-slate-900">Install</span>.</li>
              </ol>
            </div>

            <div className="border rounded-xl p-3 bg-slate-50">
              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> iPhone / iPad (Safari):
              </h5>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside font-medium">
                <li>Tap Share button <span className="font-bold text-slate-900">📤</span> at bottom of Safari.</li>
                <li>Scroll down and tap <span className="font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">Add to Home Screen (+)</span>.</li>
                <li>Tap <span className="font-bold text-slate-900">Add</span> at top right.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="border-t pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl shadow text-sm transition-colors"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(localStorage.getItem('zahi_custom_logo') || '/logo.png');
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    setupRealtimeSync();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setIsInstallGuideOpen(true);
    }
  };

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
          onInstallApp={handleInstallApp}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Mobile & Tablet Header */}
          <header className="lg:hidden bg-slate-900 text-white border-b border-slate-800 px-3 py-2.5 flex items-center justify-between shadow-md z-30 sticky top-0">
            <div className="flex items-center space-x-2.5">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-1.5 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg active:bg-slate-700 transition-colors"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div 
                onClick={() => setIsLogoModalOpen(true)}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-[#F6F4F0] border-2 border-amber-500/70 flex items-center justify-center p-0.5 overflow-hidden shadow-sm">
                  <img src={logoUrl} alt="Zahi Logo" className="w-full h-full object-contain rounded-full" />
                </div>
                <div>
                  <h1 className="font-bold text-white text-sm tracking-tight leading-none">
                    <span className="text-amber-500 font-extrabold">Zahi Abdullah</span>
                  </h1>
                  <p className="text-slate-300 text-[10px] mt-0.5 font-medium tracking-wide uppercase">Home Designing</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Prominent Yellow Install App Button on Mobile Header */}
              <button
                onClick={handleInstallApp}
                className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md border border-amber-400 transition-all transform active:scale-95"
                title="Install Mobile App"
              >
                <Download className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                Install App
              </button>
              
              <button
                onClick={() => setIsLogoModalOpen(true)}
                className="text-slate-300 hover:text-amber-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Change Profile Photo"
              >
                <Camera className="w-5 h-5" />
              </button>
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

        {/* Profile / Logo Upload Modal */}
        <LogoUploadModal 
          isOpen={isLogoModalOpen}
          onClose={() => setIsLogoModalOpen(false)}
          currentLogo={logoUrl}
          onSaveLogo={handleSaveLogo}
          onResetLogo={handleResetLogo}
        />

        {/* Visual Install Instructions Modal */}
        <InstallGuideModal
          isOpen={isInstallGuideOpen}
          onClose={() => setIsInstallGuideOpen(false)}
          logoUrl={logoUrl}
        />
      </div>
    </Router>
  );
}

export default App;
