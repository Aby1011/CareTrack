import React from 'react';
import { Settings, Clock, AlertTriangle, Home, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MaintenancePage = () => {
  const navigate = useNavigate();
  const systemName = localStorage.getItem('caretrack_system_name') || 'CareTrack';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full text-center space-y-12">
        {/* Animated Icon Container */}
        <div className="relative inline-block">
          <div className="w-32 h-32 bg-teal-500/10 rounded-[3rem] flex items-center justify-center animate-pulse">
            <Settings className="w-16 h-16 text-teal-600 animate-spin-slow" />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">
            Under <span className="text-teal-600">Maintenance</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
            {systemName} is currently undergoing scheduled system updates to improve your experience. 
            We'll be back online shortly.
          </p>
        </div>

        {/* Features/Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 transition-all hover:scale-[1.02]">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Estimated Time</h3>
              <p className="text-sm text-slate-500 font-medium">Updates usually take 30-60 minutes.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 transition-all hover:scale-[1.02]">
            <div className="p-3 bg-purple-50 rounded-2xl">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Data Safety</h3>
              <p className="text-sm text-slate-500 font-medium">All your medical records are securely encrypted.</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-8">
          <button 
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2 mx-auto active:scale-95"
          >
            <Home className="w-5 h-5" />
            Return to Home
          </button>
          <p className="mt-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
            {systemName} Medical Systems &bull; Version 2.4.0
          </p>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
};

// Add this to your index.css or equivalent
// .animate-spin-slow { animation: spin 8s linear infinite; }
// @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

export default MaintenancePage;
