import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FileText, Menu, X, ClipboardList, Camera, Upload, RotateCcw, Download, Smartphone, CheckCircle, ArrowRight, Lock, Unlock, Key, Delete, ShieldCheck } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';
import ItemSummary from './pages/ItemSummary';
import { setupRealtimeSync } from './api';

function Sidebar({ isOpen, setIsOpen, logoUrl, onOpenLogoModal, onInstallApp, onLockApp, onOpenPinModal, isAppInstalled }) {
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

        {/* Yellow Install Button in Sidebar (Hidden if already installed) */}
        {!isAppInstalled && (
          <div className="px-4 pt-4">
            <button
              onClick={onInstallApp}
              className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold px-3 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all transform active:scale-95 border border-amber-400"
            >
              <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              Install Mobile App
            </button>
          </div>
        )}

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
        <div className="p-4 text-xs text-slate-400 border-t border-slate-800 flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <span>&copy; 2026 Zahi Abdullah</span>
            <button 
              onClick={onOpenLogoModal}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px] underline font-medium"
            >
              <Camera className="w-3.5 h-3.5" /> Change Photo
            </button>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <button
              onClick={onLockApp}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5 text-xs font-bold px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" /> Lock App
            </button>
            <button
              onClick={onOpenPinModal}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] hover:underline"
            >
              <Key className="w-3 h-3 text-amber-400" /> PIN Settings
            </button>
          </div>
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
function InstallGuideModal({ isOpen, onClose, logoUrl, onDirectInstall, hasPrompt }) {
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

          <div className="bg-amber-100/70 border border-amber-300 p-3 rounded-xl text-center">
            <p className="text-xs font-bold text-amber-900 flex items-center justify-center gap-1">
              <ArrowRight className="w-4 h-4 text-amber-600 -rotate-45 animate-bounce" />
              Chrome மேல் மூலையில் 3 புள்ளிகளை (⋮) அழுத்தவும்
            </p>
          </div>

          <div className="space-y-3">
            <div className="border rounded-xl p-3 bg-slate-50">
              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Android (Google Chrome):
              </h5>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside font-medium">
                <li>பிரவுசரின் மேலே உள்ள <span className="font-bold text-slate-900 text-sm">3 புள்ளிகளை (⋮)</span> அழுத்தவும்.</li>
                <li><span className="font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">Install App</span> அல்லது <span className="font-bold text-slate-900">Add to Home screen</span> என்பதைக் கிளிக் செய்யவும்.</li>
                <li><span className="font-bold text-slate-900">Install</span> என்பதை உறுதிப்படுத்தவும்.</li>
              </ol>
            </div>

            <div className="border rounded-xl p-3 bg-slate-50">
              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> iPhone / iPad (Safari):
              </h5>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside font-medium">
                <li>Safari கீழே உள்ள Share பொத்தானை <span className="font-bold text-slate-900">📤</span> அழுத்தவும்.</li>
                <li>கீழே நகர்த்தி <span className="font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">Add to Home Screen (+)</span> தேர்வு செய்யவும்.</li>
                <li>மேலே உள்ள <span className="font-bold text-slate-900">Add</span> கொடுக்கவும்.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="border-t pt-3 flex flex-col gap-2">
          {hasPrompt && (
            <button
              onClick={onDirectInstall}
              className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg text-sm flex items-center justify-center gap-2 border border-amber-400 transition-transform active:scale-95"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              Install App Now (இப்போதே Install செய்ய)
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl shadow text-xs transition-colors"
          >
            புரிந்தது (3 புள்ளிகளை ⋮ கிளிக் செய்கிறேன்)
          </button>
        </div>
      </div>
    </div>
  );
}

// Fullscreen Luxury App Lock Component
function AppLockScreen({ onUnlock, correctPin, logoUrl }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleKeyPress = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const verifyPin = (enteredPin) => {
    if (enteredPin === correctPin) {
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin('');
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col items-center justify-center p-4 select-none">
      <div className={`w-full max-w-sm flex flex-col items-center ${shake ? 'animate-bounce' : ''}`}>
        
        {/* Circular Logo */}
        <div className="w-24 h-24 rounded-full bg-[#F6F4F0] border-4 border-amber-500 shadow-2xl flex items-center justify-center p-1 mb-4 overflow-hidden">
          <img src={logoUrl} alt="Zahi Logo" className="w-full h-full object-contain rounded-full" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-extrabold text-white tracking-tight">Zahi Abdullah</h2>
        <p className="text-xs text-amber-400 font-semibold uppercase tracking-widest mb-6">Home Designing</p>

        <div className="flex items-center gap-2 mb-6 bg-slate-900/90 px-4 py-2 rounded-full border border-slate-800 shadow">
          <Lock className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-slate-200">Enter Security PIN</span>
        </div>

        {/* PIN Indicators */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-all duration-200 border ${
                pin.length > idx
                  ? 'bg-amber-500 border-amber-400 scale-125 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                  : 'bg-slate-800 border-slate-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-400 font-bold mb-4 animate-pulse">
            Incorrect PIN! Please try again.
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="w-18 h-18 rounded-full bg-slate-900/90 hover:bg-slate-800 active:bg-amber-500 active:text-slate-950 text-white font-bold text-2xl border border-slate-800/80 shadow-md transition-all flex items-center justify-center active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="w-18 h-18 rounded-full bg-slate-900/40 text-slate-400 hover:text-white font-semibold text-xs border border-slate-800/50 flex items-center justify-center active:scale-95"
          >
            Clear
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="w-18 h-18 rounded-full bg-slate-900/90 hover:bg-slate-800 active:bg-amber-500 active:text-slate-950 text-white font-bold text-2xl border border-slate-800/80 shadow-md transition-all flex items-center justify-center active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-18 h-18 rounded-full bg-slate-900/40 text-slate-400 hover:text-white font-semibold text-xs border border-slate-800/50 flex items-center justify-center active:scale-95"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mt-8">Default PIN: 1234</p>
      </div>
    </div>
  );
}

// PIN Settings & Change Modal Component
function PinSettingsModal({ isOpen, onClose, currentPin, onUpdatePin, isLockEnabled, onToggleLock }) {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (oldPin !== currentPin) {
      setMsg({ text: 'Current PIN is incorrect!', type: 'error' });
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setMsg({ text: 'New PIN must be 4 digits!', type: 'error' });
      return;
    }
    if (newPin !== confirmPin) {
      setMsg({ text: 'New PINs do not match!', type: 'error' });
      return;
    }

    onUpdatePin(newPin);
    setMsg({ text: 'PIN updated successfully!', type: 'success' });
    setTimeout(() => {
      onClose();
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setMsg({ text: '', type: '' });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            App Security & PIN Lock
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Enable App Security Lock</h4>
              <p className="text-xs text-slate-500">Require 4-digit PIN when opening app</p>
            </div>
            <button
              type="button"
              onClick={onToggleLock}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                isLockEnabled ? 'bg-green-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {isLockEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Change 4-Digit PIN</h4>
            
            {msg.text && (
              <div className={`p-2.5 rounded-lg text-xs font-bold ${msg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                {msg.text}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Current PIN</label>
              <input
                type="password"
                maxLength={4}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="Enter current 4-digit PIN"
                className="w-full px-3 py-2 border rounded-xl text-sm tracking-widest text-center font-bold focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">New 4-Digit PIN</label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Enter new 4-digit PIN"
                className="w-full px-3 py-2 border rounded-xl text-sm tracking-widest text-center font-bold focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm New PIN</label>
              <input
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Re-enter new PIN"
                className="w-full px-3 py-2 border rounded-xl text-sm tracking-widest text-center font-bold focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow"
              >
                Save New PIN
              </button>
            </div>
          </form>
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
  const [deferredPrompt, setDeferredPrompt] = useState(window.deferredInstallPrompt || null);

  // App Installed Detection State
  const [isAppInstalled, setIsAppInstalled] = useState(() => {
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone === true ||
                         document.referrer.startsWith('android-app://');
      const isSavedInstalled = localStorage.getItem('zahi_app_installed') === 'true';
      return isStandalone || isSavedInstalled;
    }
    return false;
  });

  // App Lock & Security State
  const [appPin, setAppPin] = useState(() => localStorage.getItem('zahi_app_pin') || '1234');
  const [isLockEnabled, setIsLockEnabled] = useState(() => localStorage.getItem('zahi_app_lock_enabled') !== 'false');
  const [isLocked, setIsLocked] = useState(() => {
    const lockPref = localStorage.getItem('zahi_app_lock_enabled');
    if (lockPref === 'false') return false;
    const sessionUnlocked = sessionStorage.getItem('zahi_session_unlocked');
    return !sessionUnlocked;
  });
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  useEffect(() => {
    setupRealtimeSync();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredInstallPrompt = e;
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      localStorage.setItem('zahi_app_installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.deferredInstallPrompt) {
      setDeferredPrompt(window.deferredInstallPrompt);
    }

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e) => {
      if (e.matches) {
        setIsAppInstalled(true);
        localStorage.setItem('zahi_app_installed', 'true');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      }
    };
  }, []);

  const handleInstallApp = async () => {
    const activePrompt = deferredPrompt || window.deferredInstallPrompt;
    if (activePrompt) {
      try {
        activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;
        if (outcome === 'accepted') {
          setIsAppInstalled(true);
          localStorage.setItem('zahi_app_installed', 'true');
          setDeferredPrompt(null);
          window.deferredInstallPrompt = null;
          setIsInstallGuideOpen(false);
        }
      } catch (err) {
        console.log("Install prompt error:", err);
        setIsInstallGuideOpen(true);
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

  const handleUnlockApp = () => {
    setIsLocked(false);
    sessionStorage.setItem('zahi_session_unlocked', 'true');
  };

  const handleLockApp = () => {
    setIsLocked(true);
    sessionStorage.removeItem('zahi_session_unlocked');
  };

  const handleUpdatePin = (newPin) => {
    setAppPin(newPin);
    localStorage.setItem('zahi_app_pin', newPin);
  };

  const handleToggleLock = () => {
    const nextVal = !isLockEnabled;
    setIsLockEnabled(nextVal);
    localStorage.setItem('zahi_app_lock_enabled', nextVal ? 'true' : 'false');
    if (!nextVal) {
      setIsLocked(false);
    }
  };

  return (
    <Router>
      {/* Fullscreen Security PIN Lock Screen if locked */}
      {isLockEnabled && isLocked && (
        <AppLockScreen
          onUnlock={handleUnlockApp}
          correctPin={appPin}
          logoUrl={logoUrl}
        />
      )}

      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
          logoUrl={logoUrl}
          onOpenLogoModal={() => setIsLogoModalOpen(true)}
          onInstallApp={handleInstallApp}
          onLockApp={handleLockApp}
          onOpenPinModal={() => setIsPinModalOpen(true)}
          isAppInstalled={isAppInstalled}
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

            <div className="flex items-center space-x-1.5">
              {/* Prominent Yellow Install App Button on Mobile Header (Hidden if installed) */}
              {!isAppInstalled && (
                <button
                  onClick={handleInstallApp}
                  className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md border border-amber-400 transition-all transform active:scale-95"
                  title="Install Mobile App"
                >
                  <Download className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                  Install App
                </button>
              )}

              <button
                onClick={handleLockApp}
                className="text-amber-400 hover:text-amber-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Lock App"
              >
                <Lock className="w-5 h-5" />
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

        {/* PIN Security Settings Modal */}
        <PinSettingsModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          currentPin={appPin}
          onUpdatePin={handleUpdatePin}
          isLockEnabled={isLockEnabled}
          onToggleLock={handleToggleLock}
        />

        {/* Visual Install Instructions Modal */}
        <InstallGuideModal
          isOpen={isInstallGuideOpen}
          onClose={() => setIsInstallGuideOpen(false)}
          logoUrl={logoUrl}
          onDirectInstall={handleInstallApp}
          hasPrompt={!!(deferredPrompt || (typeof window !== 'undefined' && window.deferredInstallPrompt))}
        />
      </div>
    </Router>
  );
}

export default App;
