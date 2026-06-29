import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Bell, Moon, Globe, Shield, 
  ChevronRight, Save, CheckCircle 
} from 'lucide-react'

function SettingsPage() {
  const navigate = useNavigate()
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'English',
    privacy: 'Private'
  })

  const handleSave = () => {
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-primary-500 shadow-sm"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 active:scale-95"
          >
            {saveSuccess ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            <span>{saveSuccess ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>

        {/* Settings Groups */}
        <div className="space-y-4">
          {/* Notifications */}
          <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fade-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Push Notifications</h3>
                  <p className="text-sm text-slate-500">Enable or disable app alerts</p>
                </div>
              </div>
              <Toggle 
                enabled={settings.notifications} 
                onToggle={() => setSettings({...settings, notifications: !settings.notifications})} 
              />
            </div>
          </section>

          {/* Appearance */}
          <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fade-up delay-75">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Moon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Dark Mode</h3>
                  <p className="text-sm text-slate-500">Switch between light and dark themes</p>
                </div>
              </div>
              <Toggle 
                enabled={settings.darkMode} 
                onToggle={() => setSettings({...settings, darkMode: !settings.darkMode})} 
              />
            </div>
          </section>

          {/* Language Selection */}
          <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fade-up delay-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Language</h3>
                  <p className="text-sm text-slate-500">Choose your preferred language</p>
                </div>
              </div>
              <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                <span className="font-medium text-slate-600">{settings.language}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fade-up delay-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Privacy Status</h3>
                  <p className="text-sm text-slate-500">Manage your profile visibility</p>
                </div>
              </div>
              <select 
                value={settings.privacy}
                onChange={(e) => setSettings({...settings, privacy: e.target.value})}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Private">Private</option>
                <option value="Public">Public</option>
                <option value="CareTeamOnly">Care Team Only</option>
              </select>
            </div>
          </section>
        </div>

        {/* Footer Info */}
        <div className="text-center py-8">
          <p className="text-sm text-slate-400 font-medium tracking-tight">CareTrack v2.1.0 — 2026</p>
        </div>
      </div>
    </div>
  )
}

function Toggle({ enabled, onToggle }) {
  return (
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${enabled ? 'bg-primary-500' : 'bg-slate-300'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  )
}

export default SettingsPage
