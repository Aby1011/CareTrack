import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { users, alerts, vitalRecords, messages, getStatusColor, formatDate, getAlertColor, formatDateTime } from '../data/mockData'
import { 
  LayoutDashboard, Users, Bell, MessageSquare, Heart, 
  LogOut, ChevronRight, AlertTriangle, Search, CheckCircle,
  Phone, Mail, Calendar
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function NurseDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [systemName, setSystemName] = useState(localStorage.getItem('caretrack_system_name') || 'CareTrack')
  const navigate = useNavigate()

  // Get nurse's patients
  const nurse = users.nurses.find(n => n.id === user.id)
  const nursePatients = users.patients.filter(p => (nurse?.assignedPatients || []).includes(p.id))
  const nurseAlerts = alerts.filter(a => nursePatients.some(p => p.id === a.patientId))
  const nurseMessages = messages.filter(m => m.toId === user.id)

  const stats = [
    { label: 'Assigned Patients', value: nursePatients.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Pending Alerts', value: nurseAlerts.filter(a => !a.acknowledged).length, icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Critical Cases', value: nursePatients.filter(p => p.status === 'critical').length, icon: Heart, color: 'bg-red-500' },
    { label: 'Messages', value: nurseMessages.filter(m => !m.read).length, icon: MessageSquare, color: 'bg-purple-500' },
  ]

  const Sidebar = () => (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">{systemName}</h1>
            <p className="text-xs text-slate-400">Nurse Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'patients', label: 'My Patients', icon: Users },
          { id: 'alerts', label: 'Alerts', icon: Bell },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-colors ${
              activeTab === item.id
                ? 'bg-primary-500 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
            {item.id === 'alerts' && nurseAlerts.filter(a => !a.acknowledged).length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {nurseAlerts.filter(a => !a.acknowledged).length}
              </span>
            )}
            {item.id === 'messages' && nurseMessages.filter(m => !m.read).length > 0 && (
              <span className="ml-auto bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                {nurseMessages.filter(m => !m.read).length}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-slate-800 p-2 rounded-xl transition-colors group"
        >
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-slate-700 ring-2 ring-transparent group-hover:ring-primary-500 transition-all" />
          <div>
            <p className="font-medium text-sm group-hover:text-primary-400 transition-colors">{user.name}</p>
            <p className="text-xs text-slate-400">Care Coordinator</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-slate-300 hover:text-white"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  const getPatientVitals = (patientId) => {
    return vitalRecords.filter(v => v.patientId === patientId).slice(-7)
  }

  const DashboardContent = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Critical Alerts */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-800">Critical Alerts Requiring Immediate Action</h3>
        </div>
        <div className="space-y-3">
          {nurseAlerts.filter(a => a.type === 'critical' && !a.acknowledged).map((alert) => {
            const patient = users.patients.find(p => p.id === alert.patientId)
            return (
              <div key={alert.id} className="bg-white rounded-xl p-4 border border-red-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient?.name}`} alt={patient?.name} className="w-10 h-10 rounded-full bg-red-100" />
                  <div>
                    <p className="font-medium text-slate-800">{patient?.name}</p>
                    <p className="text-sm text-slate-500">{alert.message}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors">
                    Contact Patient
                  </button>
                  <button className="px-3 py-1.5 border border-red-200 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors">
                    Escalate to Doctor
                  </button>
                </div>
              </div>
            )
          })}
          {nurseAlerts.filter(a => a.type === 'critical' && !a.acknowledged).length === 0 && (
            <p className="text-slate-600 text-center py-4">No critical alerts at this time</p>
          )}
        </div>
      </div>

      {/* Patient Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Patient Overview</h3>
          <button onClick={() => setActiveTab('patients')} className="text-primary-600 hover:text-primary-700 text-sm font-medium">View All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nursePatients.slice(0, 6).map((patient) => (
            <div
              key={patient.id}
              onClick={() => { setSelectedPatient(patient); setActiveTab('patients'); }}
              className="p-4 border border-slate-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} alt={patient.name} className="w-10 h-10 rounded-full bg-slate-100" />
                <div>
                  <p className="font-medium text-slate-800">{patient.name}</p>
                  <p className="text-xs text-slate-500">{patient.age} yrs • {patient.gender}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(patient.status)}`}>
                  {patient.status}
                </span>
                <span className="text-xs text-slate-500">
                  {patient.adherence}% adherence
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const PatientsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-800">My Patients</h3>
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patients..."
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {selectedPatient ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedPatient(null)}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to list
            </button>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Phone className="w-5 h-5 text-slate-600" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Mail className="w-5 h-5 text-slate-600" />
              </button>
              <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Message
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Info */}
            <div className="lg:col-span-1">
              <div className="bg-slate-50 rounded-2xl p-6">
                <div className="text-center mb-4">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPatient.name}`}
                    alt={selectedPatient.name}
                    className="w-20 h-20 rounded-full mx-auto bg-white"
                  />
                  <h4 className="text-xl font-semibold text-slate-800 mt-3">{selectedPatient.name}</h4>
                  <p className="text-slate-500">{selectedPatient.age} years • {selectedPatient.gender}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPatient.status)}`}>
                    {selectedPatient.status}
                  </span>
                </div>
                <div className="space-y-3 mt-6">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Condition</span>
                    <span className="font-medium text-slate-800">{selectedPatient.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-medium text-slate-800">{selectedPatient.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Enrolled</span>
                    <span className="font-medium text-slate-800">{formatDate(selectedPatient.enrollDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Adherence</span>
                    <span className="font-medium text-slate-800">{selectedPatient.adherence}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vitals & Chart */}
            <div className="lg:col-span-2">
              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Vital Signs Trend (Last 7 Days)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getPatientVitals(selectedPatient.id)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      />
                      <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} name="Systolic BP" />
                      <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="Diastolic BP" />
                      <Line type="monotone" dataKey="pulse" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} name="Pulse" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Latest Vitals */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {(() => {
                  const latest = vitalRecords.find(v => v.patientId === selectedPatient.id)
                  if (!latest) return null
                  return (
                    <>
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-slate-500 text-sm">Systolic BP</p>
                        <p className="text-2xl font-bold text-slate-800">{latest.systolic}</p>
                        <p className="text-xs text-slate-400">mmHg</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-slate-500 text-sm">Diastolic BP</p>
                        <p className="text-2xl font-bold text-slate-800">{latest.diastolic}</p>
                        <p className="text-xs text-slate-400">mmHg</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-slate-500 text-sm">Pulse</p>
                        <p className="text-2xl font-bold text-slate-800">{latest.pulse}</p>
                        <p className="text-xs text-slate-400">bpm</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-slate-500 text-sm">Blood Sugar</p>
                        <p className="text-2xl font-bold text-slate-800">{latest.bloodSugar}</p>
                        <p className="text-xs text-slate-400">mg/dL</p>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Patient</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Condition</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Adherence</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {nursePatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} alt={patient.name} className="w-10 h-10 rounded-full bg-slate-100" />
                      <div>
                        <p className="font-medium text-slate-800">{patient.name}</p>
                        <p className="text-sm text-slate-500">{patient.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{patient.condition}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${patient.adherence >= 80 ? 'bg-green-500' : patient.adherence >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${patient.adherence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-600">{patient.adherence}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  const AlertsContent = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-800">Alerts</h3>
      <div className="space-y-4">
        {nurseAlerts.map((alert) => {
          const patient = users.patients.find(p => p.id === alert.patientId)
          return (
            <div key={alert.id} className={`p-6 rounded-2xl border ${getAlertColor(alert.type)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient?.name}`} alt={patient?.name} className="w-12 h-12 rounded-full bg-white" />
                  <div>
                    <p className="font-semibold text-lg">{patient?.name}</p>
                    <p className="text-slate-600 mt-1">{alert.message}</p>
                    <p className="text-sm text-slate-500 mt-2">{formatDateTime(alert.timestamp)}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${alert.type === 'critical' ? 'bg-red-100 text-red-700' : alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                    {alert.type}
                  </span>
                  {!alert.acknowledged && (
                    <button className="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium">
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
              {alert.type === 'critical' && !alert.acknowledged && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-red-200">
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">
                    <Phone className="w-4 h-4" />
                    Contact Patient
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-red-200 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                    Escalate to Doctor
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  const MessagesContent = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-800">Messages</h3>
      <div className="space-y-4">
        {nurseMessages.map((message) => {
          const patient = users.patients.find(p => p.id === message.patientId)
          return (
            <div key={message.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-start gap-4">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.from}`} alt={message.from} className="w-12 h-12 rounded-full bg-slate-100" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{message.from}</p>
                      <p className="text-sm text-slate-500">Re: {patient?.name}</p>
                    </div>
                    <span className="text-sm text-slate-400">{formatDateTime(message.timestamp)}</span>
                  </div>
                  <h4 className="font-medium text-slate-700 mt-2">{message.subject}</h4>
                  <p className="text-slate-600 mt-2">{message.message}</p>
                  <div className="flex gap-2 mt-4">
                    <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium">
                      Reply
                    </button>
                    <button className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium">
                      View Patient
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {nurseMessages.length === 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No messages yet</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <p className="text-slate-500 text-sm">Welcome, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                {nurseAlerts.filter(a => !a.acknowledged).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="p-8">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'patients' && <PatientsContent />}
          {activeTab === 'alerts' && <AlertsContent />}
          {activeTab === 'messages' && <MessagesContent />}
        </main>
      </div>
    </div>
  )
}

export default NurseDashboard
