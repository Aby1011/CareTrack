import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, Mail, Phone, Shield, Settings, HelpCircle, 
  LogOut, ChevronDown, ChevronUp, ArrowLeft, Heart, 
  Briefcase, MapPin, Award 
} from 'lucide-react'

function ProfilePage({ user, onLogout }) {
  const navigate = useNavigate()

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-lg font-medium">Loading profile...</div>
  }

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-primary-500 shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center animate-fade-up">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full ring-4 ring-primary-50 p-1">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full rounded-full bg-slate-100" 
              />
            </div>
            <div className="absolute bottom-1 right-1 bg-primary-500 text-white p-2 rounded-full border-4 border-white shadow-lg">
              <User className="w-5 h-5" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
          <div className="flex items-center gap-2 text-primary-600 font-medium mt-1">
            <Mail className="w-4 h-4" />
            <span>{user.email}</span>
          </div>
          <div className="mt-4 px-4 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-bold uppercase tracking-wider">
            {user.role}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-4 animate-fade-up delay-100">
          {/* Personal Info Button */}
          <button 
            onClick={() => navigate('/personal-details')}
            className="w-full flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary-300 transition-all group group-hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-600 font-bold" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-left">Personal Information</h3>
                <p className="text-sm text-slate-500 text-left">View and manage your account details</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Settings Button */}
          <button 
            onClick={() => navigate('/settings')}
            className="w-full flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary-300 transition-all group group-hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-left">Settings</h3>
                <p className="text-sm text-slate-500">Webpage configuration & preferences</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Help & Resources */}
          <button className="w-full flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-teal-300 transition-all group group-hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <HelpCircle className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-left">Help & Resources</h3>
                <p className="text-sm text-slate-500">CareTrack guides and support</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-6 bg-red-50 rounded-2xl border border-red-100 shadow-sm hover:bg-red-100 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="font-bold text-red-700 text-left">Logout</h3>
                <p className="text-sm text-red-600/70 text-left">Securely end your session</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-300" />
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="p-4 bg-white rounded-xl border border-slate-100">
      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </div>
      <p className="font-bold text-slate-800">{value}</p>
    </div>
  )
}

function ChevronRight({ className }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}

export default ProfilePage
