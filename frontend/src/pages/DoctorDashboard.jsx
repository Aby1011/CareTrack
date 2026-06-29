import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  users, alerts, vitalRecords, getStatusColor, formatDate, getAlertColor,
  formatDateTime, addVitalRecord, addNotification, assignNurseToPatient,
  getUnreadCount, formatTimeAgo, addNurse, addPatient, updatePatient,
  saveUsers, acknowledgeAlert, loadUsers, dischargePatient, followUpPlanAPI, prescriptionAPI
} from '../data/mockData'
import ChatWindow from '../components/ChatWindow'
import {
  LayoutDashboard, Users, Bell, FileText, MessageSquare,
  Heart, TrendingUp, Clock, LogOut, ChevronRight,
  Activity, AlertTriangle, Search, Calendar, Plus, Shield, CheckCircle, Phone, ArrowLeft, Mail
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function DoctorDashboard({ user, onLogout }) {
  const navigate = useNavigate()
  // State for all patients for reactivity
  const [localAllPatients, setLocalAllPatients] = useState([...users.patients])
  // Derive doctor's active patients for the roster from localAllPatients
  const localPatients = localAllPatients.filter(p => String(p.doctorId) === String(user.id) && p.registrationStatus === 'Approved')
  const [systemName, setSystemName] = useState(localStorage.getItem('caretrack_system_name') || 'CareTrack')

  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showCreateNurse, setShowCreateNurse] = useState(false)
  const [newNurseData, setNewNurseData] = useState({ name: '', email: '' })
  const [localNurses, setLocalNurses] = useState(users.nurses)
  const [showRegisterPatient, setShowRegisterPatient] = useState(false)
  const [selectedApprovalPatient, setSelectedApprovalPatient] = useState(null)
  const [selectedNurseId, setSelectedNurseId] = useState('')
  const [selectedNurse, setSelectedNurse] = useState(null)
  const [newPatientData, setNewPatientData] = useState({ name: '', email: '', condition: '', age: '', gender: 'Male' })
  const [generatedCredentials, setGeneratedCredentials] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPatients = localPatients.filter(patient =>
    (patient.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (patient.email || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (patient.condition || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  )

  // New state for prescribe medicine
  const [showPrescribeModal, setShowPrescribeModal] = useState(false)
  const [prescriptionData, setPrescribeData] = useState({ medicineName: '', dosage: '', frequency: '', duration: '', notes: '' })

  // New state for Follow-Up Plan
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [followUpData, setFollowUpData] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  })

  // New state for messaging
  const [unreadCount, setUnreadCount] = useState(getUnreadCount(user.id))
  const [activeChatPatient, setActiveChatPatient] = useState(null)
  const [reportStatus, setReportStatus] = useState(null)
  const [localAlerts, setLocalAlerts] = useState(alerts)

  const doctorAlerts = localAlerts.filter(a => localPatients.some(p => String(p.id) === String(a.patientId)))

  const handleAcknowledge = (alertId) => {
    const updatedAlert = acknowledgeAlert(alertId, user.name);
    if (updatedAlert) {
      setLocalAlerts([...alerts]);
      const patient = users.patients.find(p => String(p.id) === String(updatedAlert.patientId));
      if (patient) {
        setSelectedPatient(patient);
        setActiveTab('patients');
      }
    }
  };

  const handleDischargePatient = (patientId) => {
    if (window.confirm("Are you sure you want to end follow-up for this patient? This will move them to 'Discharged' status, but their records will be preserved.")) {
      if (dischargePatient(patientId, user.name)) {
        setLocalAllPatients([...users.patients]);
        setSelectedPatient(null);
        alert("Patient discharged successfully.");
      }
    }
  };

  const handleSavePlan = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const action = selectedPatient.followUpPlan ? 'update' : 'create';
    const success = followUpPlanAPI[action](selectedPatient.id, followUpData);

    if (success) {
      alert(`Follow-up plan ${action === 'create' ? 'assigned' : 'updated'} successfully!`);
      setShowFollowUpModal(false);
      // Refresh local state will be handled by caretrack_sync event
    }
  };



  useEffect(() => {
    const handleSync = (e) => {
      if (e.key === 'caretrack_users' || !e.key || e.type === 'caretrack_sync') {
        const freshUsers = e.detail?.data || loadUsers();
        setLocalAllPatients([...freshUsers.patients]);
        setUnreadCount(getUnreadCount(user.id));
        setSystemName(localStorage.getItem('caretrack_system_name') || 'CareTrack');

        // If we have a selected patient, refresh their data from the fresh list
        if (selectedPatient) {
          const updated = freshUsers.patients.find(p => String(p.id) === String(selectedPatient.id));
          if (updated) {
            setSelectedPatient({ ...updated });
          }
        }
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('caretrack_sync', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('caretrack_sync', handleSync);
    };
  }, [user.id, selectedPatient?.id]);

  // Get doctor object
  const doctor = users.doctors.find(d => String(d.id) === String(user.id))

  const stats = [
    { label: 'My Patients', value: localPatients.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Pending Alerts', value: doctorAlerts.filter(a => !a.acknowledged).length, icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Nurses', value: localNurses.length, icon: Shield, color: 'bg-purple-500' },
    { label: 'Critical', value: localPatients.filter(p => p.status === 'critical').length, icon: Heart, color: 'bg-red-500' },
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
            <p className="text-xs text-slate-400">Doctor Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'patients', label: 'My Patients', icon: Users },
          { id: 'approvals', label: 'Approvals', icon: CheckCircle, badge: localAllPatients.filter(p => p.registrationStatus === 'Pending' && (p.doctorId === user.id || !p.doctorId)).length },
          { id: 'nurses', label: 'Nurses', icon: Activity },
          { id: 'alerts', label: 'Alerts', icon: Bell },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'reports', label: 'Reports', icon: FileText },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); if (item.id !== 'messages') setActiveChatPatient(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-colors relative ${activeTab === item.id
              ? 'bg-primary-500 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
            {item.badge > 0 && (
              <span className="ml-auto bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-indigo-500/20">
                {item.badge}
              </span>
            )}
            {item.id === 'messages' && unreadCount > 0 && (
              <span className="absolute right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            )}
            {item.id === 'alerts' && doctorAlerts.filter(a => !a.acknowledged).length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-red-500/20">
                {doctorAlerts.filter(a => !a.acknowledged).length}
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
            <p className="text-xs text-slate-400">{user.specialty}</p>
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

      {/* Critical & At-Risk Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Critical Patients</h3>
          <div className="space-y-3">
            {localPatients.filter(p => p.status === 'critical').map((patient) => (
              <div
                key={patient.id}
                onClick={() => { setSelectedPatient(patient); setActiveTab('patients'); }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl cursor-pointer hover:border-red-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} alt={patient.name} className="w-10 h-10 rounded-full bg-red-100" />
                    <div>
                      <p className="font-medium text-slate-800">{patient.name}</p>
                      <p className="text-sm text-slate-500">{patient.condition}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400" />
                </div>
              </div>
            ))}
            {localPatients.filter(p => p.status === 'critical').length === 0 && (
              <p className="text-slate-500 text-center py-4">No critical patients</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">At-Risk Patients</h3>
          <div className="space-y-3">
            {localPatients.filter(p => p.status === 'at-risk').map((patient) => (
              <div
                key={patient.id}
                onClick={() => { setSelectedPatient(patient); setActiveTab('patients'); }}
                className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl cursor-pointer hover:border-yellow-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} alt={patient.name} className="w-10 h-10 rounded-full bg-yellow-100" />
                    <div>
                      <p className="font-medium text-slate-800">{patient.name}</p>
                      <p className="text-sm text-slate-500">{patient.condition}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
            ))}
            {localPatients.filter(p => p.status === 'at-risk').length === 0 && (
              <p className="text-slate-500 text-center py-4">No at-risk patients</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Recent Alerts</h3>
          <button onClick={() => setActiveTab('alerts')} className="text-primary-600 hover:text-primary-700 text-sm font-medium">View All</button>
        </div>
        <div className="space-y-3">
          {doctorAlerts.filter(a => !a.acknowledged).slice(0, 5).map((alert) => {
            const patient = users.patients.find(p => p.id === alert.patientId)
            return (
              <div key={alert.id} className={`p-4 rounded-xl border ${getAlertColor(alert.type)} flex items-center justify-between`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800">{patient?.name || 'Unknown Patient'}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${alert.type === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-1">{alert.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{formatTimeAgo(alert.timestamp)}</p>
                </div>
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-primary-500 hover:text-primary-600 rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  Acknowledge
                </button>
              </div>
            )
          })}
          {doctorAlerts.filter(a => !a.acknowledged).length === 0 && (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-medium">No pending alerts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const PatientsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-800">My Patients</h3>
        <div className="flex items-center gap-3">
          {!selectedPatient && (
            <button
              onClick={() => setShowRegisterPatient(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Register Patient
            </button>
          )}
          {!selectedPatient && (
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
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
              <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
                {[
                  { id: 'monitor', label: 'Monitor', color: 'hover:bg-blue-500 hover:text-white', icon: Activity },
                  { id: 'consult', label: 'Consult', color: 'hover:bg-purple-500 hover:text-white', icon: Calendar },
                  { id: 'hospital', label: 'Hospital', color: 'hover:bg-red-500 hover:text-white', icon: Heart },
                  { id: 'contact', label: 'Contact', color: 'hover:bg-green-500 hover:text-white', icon: Phone },
                  { id: 'discharge', label: 'Discharge', color: 'hover:bg-red-600 hover:text-white', icon: LogOut },
                  { id: 'resolve', label: 'Resolve', color: 'hover:bg-slate-900 hover:text-white', icon: CheckCircle },
                ].map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      if (action.id === 'discharge') {
                        handleDischargePatient(selectedPatient.id);
                        return;
                      }
                      alert(`Action: ${action.label} initiated for ${selectedPatient.name}`);
                      if (action.id === 'resolve') {
                        updatePatient(selectedPatient.id, { status: 'stable' });
                        setLocalAllPatients(prev => prev.map(p => p.id === selectedPatient.id ? { ...p, status: 'stable' } : p));
                        setSelectedPatient({ ...selectedPatient, status: 'stable' });
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-600 ${action.color}`}
                    title={action.label}
                  >
                    <action.icon className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">{action.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  if (selectedPatient.followUpPlan) {
                    setFollowUpData({
                      name: selectedPatient.followUpPlan.name,
                      description: selectedPatient.followUpPlan.description,
                      startDate: selectedPatient.followUpPlan.startDate,
                      endDate: selectedPatient.followUpPlan.endDate || ''
                    });
                  } else {
                    setFollowUpData({
                      name: '',
                      description: '',
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: ''
                    });
                  }
                  setShowFollowUpModal(true);
                }}
                className={`px-4 py-2 ${selectedPatient.followUpPlan ? 'bg-primary-500' : 'bg-slate-800'} text-white rounded-lg text-sm font-medium transition-colors`}>
                <Plus className="w-4 h-4 inline mr-2" />
                {selectedPatient.followUpPlan ? 'Update Plan' : 'Create Plan'}
              </button>
              <button
                onClick={() => setShowPrescribeModal(true)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">
                <Plus className="w-4 h-4 inline mr-2" />
                Prescribe
              </button>
              <button
                onClick={() => { setActiveChatPatient(selectedPatient); setActiveTab('messages'); }}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                title="Message Patient"
              >
                <MessageSquare className="w-5 h-5 text-slate-600" />
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
                    <span className="text-slate-500">Enrolled</span>
                    <span className="font-medium text-slate-800">{formatDate(selectedPatient.enrollDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Adherence</span>
                    <span className="font-medium text-slate-800">{selectedPatient.adherence}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-y border-slate-100 my-2">
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-xs">Follow-Up Plan</span>
                      <span className="font-bold text-slate-800 text-sm">{selectedPatient.followUpPlan?.name || 'No Plan assigned'}</span>
                    </div>
                    {selectedPatient.followUpPlan && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Active</span>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <span className="text-slate-500 text-sm font-medium mb-2 block">Assigned Nurse</span>
                    <div className="flex gap-2">
                      <select
                        value={selectedNurseId || selectedPatient.nurseId || ''}
                        onChange={(e) => setSelectedNurseId(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="">Select Nurse</option>
                        {localNurses.filter(n => n.isApproved && n.assignedDoctorId === user.id).map(nurse => (
                          <option key={nurse.id} value={nurse.id}>{nurse.name} ({nurse.department})</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          if (!selectedNurseId) {
                            alert('Please select a nurse first');
                            return;
                          }
                          const success = assignNurseToPatient(selectedPatient.id, parseInt(selectedNurseId));
                          if (success) {
                            alert(`Nurse successfully assigned to ${selectedPatient.name}`);
                            setLocalNurses([...users.nurses]);
                            setLocalAllPatients([...users.patients]);
                            setSelectedPatient(users.patients.find(p => p.id === selectedPatient.id));
                          }
                        }}
                        className="px-4 py-2 bg-teal-500 text-white rounded-xl text-xs font-bold hover:bg-teal-600 transition-all shadow-sm"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vitals Chart */}
            <div className="lg:col-span-2">
              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Vital Signs Trend (Last 7 Days)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vitalRecords.filter(v => v.patientId === selectedPatient.id).slice(-7)}>
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

          {/* Health History */}
          <div className="mt-8">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-500" />
                  Health History & Past Vitals
                </h4>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">All Records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
                      <th className="px-6 py-4 font-bold">Date</th>
                      <th className="px-6 py-4 font-bold">BP (Sys/Dia)</th>
                      <th className="px-6 py-4 font-bold">Pulse</th>
                      <th className="px-6 py-4 font-bold">Glucose</th>
                      <th className="px-6 py-4 font-bold">Pain</th>
                      <th className="px-6 py-4 font-bold">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {vitalRecords
                      .filter(v => v.patientId === selectedPatient.id)
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((record, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">{formatDate(record.date)}</td>
                          <td className="px-6 py-4">
                            <span className={`font-bold ${record.systolic > 140 ? 'text-red-500' : 'text-slate-800'}`}>
                              {record.systolic}/{record.diastolic}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1">mmHg</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{record.pulse} <span className="text-[10px] text-slate-400">bpm</span></td>
                          <td className="px-6 py-4">
                            <span className={record.bloodSugar > 180 ? 'text-yellow-600 font-bold' : 'text-slate-600 font-medium'}>
                              {record.bloodSugar}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1">mg/dL</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${record.painLevel > 5 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                              {record.painLevel}/10
                            </span>
                          </td>
                          <td className="px-6 -4 text-slate-500 italic max-w-xs truncate" title={record.notes}>{record.notes}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Prescribe Medicine Modal */}
          {showPrescribeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl animate-scale-up">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Prescribe Medicine</h3>
                  <button
                    onClick={() => setShowPrescribeModal(false)}
                    className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  prescriptionAPI.create(selectedPatient.id, user.id, prescriptionData);
                  alert(`Digital Prescription for ${prescriptionData.medicineName} generated successfully!`);
                  setShowPrescribeModal(false);
                  setPrescribeData({ medicineName: '', dosage: '', frequency: '', duration: '', notes: '' });
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Medicine Name</label>
                    <input
                      type="text"
                      required
                      value={prescriptionData.medicineName}
                      onChange={e => setPrescribeData({ ...prescriptionData, medicineName: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Amoxicillin"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Dosage</label>
                      <input
                        type="text"
                        required
                        value={prescriptionData.dosage}
                        onChange={e => setPrescribeData({ ...prescriptionData, dosage: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g. 500mg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                      <input
                        type="text"
                        required
                        value={prescriptionData.frequency}
                        onChange={e => setPrescribeData({ ...prescriptionData, frequency: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g. Twice a day"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                    <input
                      type="text"
                      required
                      value={prescriptionData.duration}
                      onChange={e => setPrescribeData({ ...prescriptionData, duration: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                      placeholder="e.g. 7 days"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
                    <textarea
                      value={prescriptionData.notes}
                      onChange={e => setPrescribeData({ ...prescriptionData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none h-24"
                      placeholder="e.g. Take after meals..."
                    ></textarea>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPrescribeModal(false)}
                      className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary-500/25"
                    >
                      Send Prescription
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {showRegisterPatient && !generatedCredentials && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 font-sans">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-slate-800">Register New Patient</h4>
                <button
                  onClick={() => setShowRegisterPatient(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleRegisterPatient} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newPatientData.name}
                    onChange={e => setNewPatientData({ ...newPatientData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newPatientData.email}
                    onChange={e => setNewPatientData({ ...newPatientData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
                  <input
                    type="text"
                    required
                    value={newPatientData.condition}
                    onChange={e => setNewPatientData({ ...newPatientData, condition: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Hypertension"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      required
                      value={newPatientData.age}
                      onChange={e => setNewPatientData({ ...newPatientData, age: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select
                      value={newPatientData.gender}
                      onChange={e => setNewPatientData({ ...newPatientData, gender: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full md:w-auto px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/25 active:scale-95"
                  >
                    Complete Registration
                  </button>
                </div>
              </form>
            </div>
          )}

          {generatedCredentials && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 max-w-md mx-auto mb-6 scale-in-center">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-slate-800">Registration Successful!</h4>
                <p className="text-slate-500 text-sm">Please print this slip and hand it to the patient.</p>
              </div>

              <div id="printable-slip" className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">CareTrack</h5>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Patient Login Slip</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Patient Name</p>
                    <p className="font-semibold text-slate-800">{generatedCredentials.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Username</p>
                      <p className="font-mono font-bold text-primary-600 bg-white px-2 py-1 rounded border border-primary-100">
                        {generatedCredentials.username}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Temp Password</p>
                      <p className="font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200">
                        {generatedCredentials.tempPassword}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200">
                  <p className="text-[10px] text-slate-500 leading-relaxed text-center">
                    Security Notice: Please login and change your password immediately.
                    This slip contains sensitive information.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition-colors"
                >
                  Print Slip
                </button>
                <button
                  onClick={() => {
                    setGeneratedCredentials(null)
                    setShowRegisterPatient(false)
                  }}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Condition</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Adherence</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPatients.map((patient) => (
                  <tr key={String(patient.id)} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} alt={patient.name} className="w-10 h-10 rounded-full bg-slate-100" />
                        <div>
                          <p className="font-medium text-slate-800">{patient.name}</p>
                          <p className="text-sm text-slate-500">{patient.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{patient.condition}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${patient.nurseId ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {patient.nurseId ? 'Assigned' : 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${patient.adherence >= 80 ? 'bg-green-500' : patient.adherence >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${patient.adherence}%` }}
                          ></div>
                        </div>
                        <span>{patient.adherence}%</span>
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
        </>
      )}
    </div>
  )

  const AlertsContent = () => {
    const pendingAlerts = doctorAlerts.filter(a => !a.acknowledged);
    const acknowledgedAlerts = doctorAlerts.filter(a => a.acknowledged);

    return (
      <div className="space-y-8 animate-fade-up">
        {/* Pending Alerts Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-500" />
              Pending Critical Alerts
              <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
                {pendingAlerts.length}
              </span>
            </h3>
          </div>

          <div className="space-y-4">
            {pendingAlerts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-slate-800 mb-1">Stay sharp, Doctor!</h4>
                <p className="text-slate-500">There are no pending critical alerts at the moment.</p>
              </div>
            ) : (
              pendingAlerts.map((alert) => {
                const patient = users.patients.find(p => p.id === alert.patientId)
                return (
                  <div key={alert.id} className={`p-6 rounded-3xl border-2 ${alert.type === 'critical' ? 'bg-red-50/50 border-red-100' : 'bg-yellow-50/50 border-yellow-100'} hover:shadow-lg transition-all group`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient?.name}`} alt={patient?.name} className="w-14 h-14 rounded-2xl bg-white shadow-sm ring-4 ring-white" />
                          <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${alert.type === 'critical' ? 'bg-red-500' : 'bg-yellow-400'}`}></span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 text-lg group-hover:text-primary-600 transition-colors uppercase tracking-tight">{patient?.name}</p>
                            <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase ${alert.type === 'critical' ? 'bg-red-500 text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                              {alert.type}
                            </span>
                          </div>
                          <p className="text-slate-700 font-medium mt-1 leading-relaxed">{alert.message}</p>
                          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDateTime(alert.timestamp)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* Acknowledged Alerts Section */}
        {acknowledgedAlerts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4 mt-12">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 opacity-60">
                <CheckCircle className="w-5 h-5" />
                In Review / Acknowledged
              </h3>
            </div>

            <div className="space-y-3 opacity-75 hover:opacity-100 transition-opacity">
              {acknowledgedAlerts.map((alert) => {
                const patient = users.patients.find(p => String(p.id) === String(alert.patientId))
                return (
                  <div key={alert.id} className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-all shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient?.name}`} alt={patient?.name} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100" />
                      <div>
                        <p className="font-bold text-slate-800">{patient?.name}</p>
                        <p className="text-sm text-slate-500 line-clamp-1">{alert.message}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[10px] text-slate-400 font-medium">By {alert.acknowledgedBy}</p>
                          <p className="text-[10px] text-slate-400 font-medium">•</p>
                          <p className="text-[10px] text-slate-400 font-medium">{formatDate(alert.acknowledgedAt)}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedPatient(patient); setActiveTab('patients'); }}
                      className="p-2 hover:bg-slate-50 text-slate-400 hover:text-primary-500 rounded-xl transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    )
  }

  const MessagesContent = () => (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Patient List */}
        <div className="w-full md:w-80 space-y-3">
          <h3 className="text-lg font-bold text-slate-800 px-2 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500" />
            Conversations
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {localPatients.length === 0 ? (
              <p className="text-slate-400 text-sm p-4 text-center italic">No patients assigned yet.</p>
            ) : (
              localPatients.map(p => {
                const isSelected = activeChatPatient && String(activeChatPatient.id) === String(p.id);
                return (
                  <button
                    key={String(p.id)}
                    onClick={() => setActiveChatPatient(p)}
                    className={`w-full flex items-center gap-3 p-4 text-left transition-all border-b border-slate-50 last:border-none ${isSelected ? 'bg-primary-50 border-l-4 border-l-primary-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                      }`}
                  >
                    <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full shadow-sm bg-slate-100" />
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${isSelected ? 'text-primary-700' : 'text-slate-800'}`}>{p.name}</p>
                      <p className="text-xs text-slate-500 truncate">{p.condition}</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1">
          {activeChatPatient ? (
            <ChatWindow
              currentUser={user}
              otherUser={activeChatPatient}
              patientId={activeChatPatient.id}
            />
          ) : (
            <div className="h-[600px] bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center p-8 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-slate-300" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Select a patient</h4>
              <p className="text-slate-500 max-w-xs">Choose a patient from the list on the left to start or continue a conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const handleApprovePatient = (patientId) => {
    try {
      console.log("handleApprovePatient called for:", patientId);
      // Use the global users object directly for mutation before save
      const patient = users.patients.find(p => String(p.id) === String(patientId));

      if (patient) {
        patient.isApproved = true;
        patient.isRejected = false;
        patient.registrationStatus = 'Approved';
        patient.doctorId = user.id;
        // Optionally update status to 'Approved' as requested by user's logic requirements
        // patient.status = 'stable'; // Keep as stable for clinical dashboards

        // Update global mock storage - this saves the 'users' object we just mutated
        saveUsers();

        // Add notification (this also saves users if it modifies the same object, but here it adds to notifications array)
        addNotification(patientId, `Your registration has been approved by Dr. ${user.name.split(' ')[1]}. You are now assigned to their care team.`);

        // Sync local state to trigger UI update
        // We spread to create a new array reference for React reactivity
        setLocalAllPatients([...users.patients]);

        if (selectedApprovalPatient && String(selectedApprovalPatient.id) === String(patientId)) {
          setSelectedApprovalPatient(null);
          setSelectedPatient(patient);
          setActiveTab('patients');
        }
        console.log(`Successfully approved patient: ${patient.name}`);
      } else {
        console.error("Patient not found for approval:", patientId);
      }
    } catch (error) {
      console.error("Error in handleApprovePatient:", error);
    }
  };

  const handleRejectPatient = (patientId) => {
    try {
      console.log("handleRejectPatient called for:", patientId);
      // Use the global users object directly for mutation
      const patient = users.patients.find(p => String(p.id) === String(patientId));

      if (patient) {
        const patientName = patient.name;

        // Mark as rejected
        patient.doctorId = null;
        patient.isApproved = false;
        patient.isRejected = true;
        patient.registrationStatus = 'Rejected';

        // Update global mock storage
        saveUsers();

        // Add notification
        addNotification(patientId, `Your registration request was not approved at this time. Please contact the clinic for more information.`);

        // Sync local state to trigger UI update
        setLocalAllPatients([...users.patients]);

        if (selectedApprovalPatient && String(selectedApprovalPatient.id) === String(patientId)) {
          setSelectedApprovalPatient(null);
        }
        console.log(`Successfully rejected request for: ${patientName}`);
      } else {
        console.error("Patient not found for rejection:", patientId);
      }
    } catch (error) {
      console.error("Error in handleRejectPatient:", error);
    }
  };

  const ApprovalsContent = () => {
    const pendingPatients = localAllPatients.filter(p => p.registrationStatus === 'Pending' && (p.doctorId === user.id || !p.doctorId));

    if (selectedApprovalPatient) {
      return (
        <div className="space-y-6 animate-fade-up">
          <button
            onClick={() => setSelectedApprovalPatient(null)}
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
          >
            ← Back to requests
          </button>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-slate-50">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedApprovalPatient.name}`}
                alt={selectedApprovalPatient.name}
                className="w-32 h-32 rounded-3xl bg-slate-50 border-4 border-white shadow-xl"
              />
              <div className="text-center md:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedApprovalPatient.name}</h3>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-widest">Pending Review</span>
                </div>
                <p className="text-lg text-slate-500 font-medium">{selectedApprovalPatient.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                  <div className="bg-slate-50 px-4 py-2 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Age</p>
                    <p className="font-bold text-slate-700">{selectedApprovalPatient.age} Years</p>
                  </div>
                  <div className="bg-slate-50 px-4 py-2 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Gender</p>
                    <p className="font-bold text-slate-700">{selectedApprovalPatient.gender}</p>
                  </div>
                  <div className="bg-slate-50 px-4 py-2 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Condition</p>
                    <p className="font-bold text-primary-600">{selectedApprovalPatient.condition}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 min-w-[200px]">
                <button
                  type="button"
                  onClick={() => handleApprovePatient(selectedApprovalPatient.id)}
                  className="w-full px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                  Approve Registration
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRejectPatient(selectedApprovalPatient.id);
                  }}
                  className="w-full px-6 py-4 bg-white text-red-600 border border-red-100 rounded-2xl font-bold hover:bg-red-50 transition-all active:scale-95"
                >
                  Reject Request
                </button>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Initial Symptoms/Notes</h4>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic text-slate-600 leading-relaxed">
                  {selectedApprovalPatient.consultationReason || "No initial notes provided by patient."}
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-bold not-italic">
                    <Clock className="w-3.5 h-3.5" />
                    REGISTERED ON {formatDateTime(selectedApprovalPatient.registeredAt || new Date().toISOString())}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Review Requirements</h4>
                <div className="space-y-3">
                  {[
                    "Verified primary contact information",
                    "Initial health assessment reviewed",
                    "Patient insurance/ID verified (Mock)",
                    "Assigned to Dr. " + user.name.split(' ')[1]
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      {req}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fade-up">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-6 h-6 text-primary-500" />
          <h3 className="text-xl font-bold text-slate-800">Patient Registration Requests</h3>
        </div>

        {pendingPatients.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">All patient registrations are up to date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingPatients.map(patient => (
              <div key={patient.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} alt={patient.name} className="w-14 h-14 rounded-full bg-slate-100 border-2 border-white shadow-sm" />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Plus className="w-3 h-3 text-white" />
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">{patient.name}</p>
                    <p className="text-sm text-slate-500">{patient.age}y • {patient.gender} • {patient.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprovePatient(patient.id)}
                    className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-all active:scale-95"
                    title="Quick Approve"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedApprovalPatient(patient);
                    }}
                    className="px-5 py-2.5 bg-primary-500 text-white rounded-2xl text-sm font-bold hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const generatePatientSummaryPDF = () => {
    const doc = new jsPDF()
    const now = new Date().toLocaleDateString('en-IN')
    doc.setFontSize(18)
    doc.setTextColor(30, 41, 59)
    doc.text('Patient Summary Report', 14, 20)
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(`Dr. ${user.name}  |  Generated: ${now}`, 14, 28)
    doc.line(14, 32, 196, 32)
    autoTable(doc, {
      startY: 36,
      head: [['Name', 'Age', 'Gender', 'Condition', 'Status', 'Adherence', 'Follow-Up Plan']],
      body: localPatients.map(p => [
        p.name,
        p.age,
        p.gender,
        p.condition,
        p.status,
        `${p.adherence}%`,
        p.followUpPlan?.name || 'None'
      ]),
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.1 }
    })
    const finalY = doc.lastAutoTable?.finalY || 80
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text(`Total Patients: ${localPatients.length}  |  Critical: ${localPatients.filter(p => p.status === 'critical').length}  |  At-Risk: ${localPatients.filter(p => p.status === 'at-risk').length}  |  Stable: ${localPatients.filter(p => p.status === 'stable').length}`, 14, finalY + 10)
    doc.save(`patient_summary_${Date.now()}.pdf`)
  }

  const generateVitalTrendsPDF = () => {
    const doc = new jsPDF()
    const now = new Date().toLocaleDateString('en-IN')
    doc.setFontSize(18)
    doc.setTextColor(30, 41, 59)
    doc.text('Vital Trends Report', 14, 20)
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(`Dr. ${user.name}  |  Generated: ${now}`, 14, 28)
    doc.line(14, 32, 196, 32)
    let currentY = 36
    localPatients.forEach(patient => {
      const records = vitalRecords.filter(v => v.patientId === patient.id).slice(-7)
      if (records.length === 0) return
      if (currentY > 220) { doc.addPage(); currentY = 20 }
      doc.setFontSize(11)
      doc.setTextColor(30, 41, 59)
      doc.text(`${patient.name} (${patient.condition})`, 14, currentY)
      autoTable(doc, {
        startY: currentY + 4,
        head: [['Date', 'Systolic', 'Diastolic', 'Pulse (bpm)', 'Blood Sugar (mg/dL)', 'Pain (0-10)']],
        body: records.map(r => [r.date, r.systolic, r.diastolic, r.pulse, r.bloodSugar, r.painLevel]),
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { cellPadding: 2.5, lineColor: [226, 232, 240], lineWidth: 0.1 }
      })
      currentY = (doc.lastAutoTable?.finalY || currentY + 30) + 10
    })
    doc.save(`vital_trends_${Date.now()}.pdf`)
  }

  const generateAdherencePDF = () => {
    const doc = new jsPDF()
    const now = new Date().toLocaleDateString('en-IN')
    doc.setFontSize(18)
    doc.setTextColor(30, 41, 59)
    doc.text('Adherence Report', 14, 20)
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(`Dr. ${user.name}  |  Generated: ${now}`, 14, 28)
    doc.line(14, 32, 196, 32)
    const avgAdherence = localPatients.length > 0 ? Math.round(localPatients.reduce((s, p) => s + (p.adherence || 0), 0) / localPatients.length) : 0
    autoTable(doc, {
      startY: 36,
      head: [['Patient', 'Condition', 'Adherence %', 'Status', 'Follow-Up Plan', 'Risk Level']],
      body: localPatients
        .sort((a, b) => (a.adherence || 0) - (b.adherence || 0))
        .map(p => [
          p.name,
          p.condition,
          `${p.adherence}%`,
          p.status,
          p.followUpPlan?.name || 'None',
          p.adherence >= 80 ? 'Low Risk' : p.adherence >= 60 ? 'Moderate' : 'High Risk'
        ]),
      headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === 'body') {
          const val = parseInt(data.cell.raw)
          if (val < 60) data.cell.styles.textColor = [239, 68, 68]
          else if (val < 80) data.cell.styles.textColor = [245, 158, 11]
          else data.cell.styles.textColor = [16, 185, 129]
        }
      },
      styles: { cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.1 }
    })
    const finalY = doc.lastAutoTable?.finalY || 80
    doc.setFontSize(10)
    doc.setTextColor(30, 41, 59)
    doc.text(`Fleet Average Adherence: ${avgAdherence}%  |  High Risk (<60%): ${localPatients.filter(p => p.adherence < 60).length} patients`, 14, finalY + 10)
    doc.save(`adherence_report_${Date.now()}.pdf`)
  }

  const ReportsContent = () => {
    const handleGenerate = (type, fn) => {
      try {
        fn()
        setReportStatus({ type, msg: 'PDF downloaded successfully!' })
        setTimeout(() => setReportStatus(null), 3000)
      } catch (err) {
        setReportStatus({ type, msg: 'Error generating report. Try again.' })
      }
    }
    const cards = [
      { id: 'summary', label: 'Patient Summary', desc: 'Full overview of all assigned patients including status, adherence & follow-up plans.', icon: FileText, color: 'from-indigo-500 to-purple-600', fn: generatePatientSummaryPDF },
      { id: 'vitals', label: 'Vital Trends', desc: 'Last 7 days of BP, pulse & blood sugar readings for each patient.', icon: Activity, color: 'from-emerald-500 to-teal-600', fn: generateVitalTrendsPDF },
      { id: 'adherence', label: 'Adherence Report', desc: 'Patient compliance analysis ranked by adherence score with risk flagging.', icon: TrendingUp, color: 'from-amber-500 to-orange-600', fn: generateAdherencePDF },
    ]
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Reports</h3>
          <p className="text-slate-500 mt-1">Generate and download clinical PDF reports for your patients.</p>
        </div>
        {reportStatus && (
          <div className="flex items-center gap-3 px-5 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium text-sm animate-fade-in">
            <CheckCircle className="w-5 h-5" />
            {reportStatus.msg}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map(card => (
            <div key={card.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all group">
              <div className={`h-2 bg-gradient-to-r ${card.color}`} />
              <div className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-slate-800 text-lg">{card.label}</h4>
                <p className="text-sm text-slate-500 mt-1 mb-5 leading-relaxed">{card.desc}</p>
                <button
                  onClick={() => handleGenerate(card.id, card.fn)}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r ${card.color} text-white hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2`}
                >
                  <FileText className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-primary-500" />Quick Stats</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Patients', value: localPatients.length, color: 'text-indigo-600 bg-indigo-50' },
              { label: 'Critical', value: localPatients.filter(p => p.status === 'critical').length, color: 'text-red-600 bg-red-50' },
              { label: 'At-Risk', value: localPatients.filter(p => p.status === 'at-risk').length, color: 'text-amber-600 bg-amber-50' },
              { label: 'Avg Adherence', value: localPatients.length > 0 ? `${Math.round(localPatients.reduce((s, p) => s + (p.adherence || 0), 0) / localPatients.length)}%` : 'N/A', color: 'text-emerald-600 bg-emerald-50' },
            ].map((s, i) => (
              <div key={i} className={`rounded-xl p-4 ${s.color}`}>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{s.label}</p>
                <p className="text-3xl font-black mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const handleRegisterPatient = (e) => {
    e.preventDefault()

    // Generate username from name: first_last
    const nameParts = newPatientData.name.toLowerCase().split(' ')
    const username = `${nameParts[0]}${nameParts[1] || ''}_${Math.floor(Math.random() * 900) + 100}`
    const tempPassword = Math.random().toString(36).slice(-8)

    const newPat = addPatient({
      ...newPatientData,
      username,
      tempPassword,
      doctorId: user.id,
      isApproved: true // Doctor-registered patients are auto-approved
    })

    setLocalAllPatients(prev => [...prev, newPat])
    setGeneratedCredentials({
      name: newPatientData.name,
      username,
      tempPassword
    })
    setNewPatientData({ name: '', email: '', condition: '', age: '', gender: 'Male' })
  }

  const handleCreateNurse = (e) => {
    e.preventDefault()
    const newNurse = addNurse({
      name: `Nurse ${newNurseData.name}`,
      email: newNurseData.email
    })
    setLocalNurses([...localNurses, newNurse])
    setNewNurseData({ name: '', email: '' })
    setShowCreateNurse(false)
  }

  const NursesContent = () => {
    // Only show approved nurses assigned to this doctor
    const doctorNurses = localNurses.filter(n => n.isApproved && n.assignedDoctorId === user.id);

    if (selectedNurse) {
      const nursePatients = localAllPatients.filter(p => p.nurseId === selectedNurse.id);

      return (
        <div className="space-y-6 animate-fade-in">
          <button
            onClick={() => setSelectedNurse(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium mb-4 underline decoration-slate-200 underline-offset-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Team List
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Nurse Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm sticky top-24">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <img src={selectedNurse.avatar} alt={selectedNurse.name} className="w-32 h-32 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-xl" />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{selectedNurse.name}</h3>
                  <p className="text-primary-600 font-bold mt-1 uppercase tracking-wider text-xs">{selectedNurse.department}</p>

                  <div className="w-full space-y-4 mt-8">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl text-left border border-slate-100/50">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <Mail className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Contact Email</p>
                        <p className="text-sm text-slate-700 font-bold truncate">{selectedNurse.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl text-left border border-slate-100/50">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <Phone className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Phone Number</p>
                        <p className="text-sm text-slate-700 font-bold">{selectedNurse.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white w-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl"></div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 relative z-10">Performance Index</p>
                    <div className="flex items-end justify-between relative z-10">
                      <div>
                        <p className="text-3xl font-black">98%</p>
                        <p className="text-[10px] text-teal-400 font-bold uppercase">Patient Satisfaction</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-teal-500 opacity-50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Patients List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Assigned Patients</h3>
                  <p className="text-sm text-slate-500">Managing {nursePatients.length} remote care cases</p>
                </div>
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-500" />
                </div>
              </div>

              {nursePatients.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-100">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-slate-200" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">No Patients Assigned</h4>
                  <p className="text-slate-500 max-w-xs mx-auto">This nurse currently has no active patients assigned by you.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {nursePatients.map(patient => (
                    <div
                      key={String(patient.id)}
                      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md hover:border-primary-100 transition-all cursor-pointer group animate-fade-up"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setActiveTab('patients');
                      }}
                    >
                      <div className="flex items-center gap-5">
                        <img src={patient.avatar} alt={patient.name} className="w-14 h-14 rounded-2xl bg-slate-50 shadow-inner" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{patient.name}</p>
                            <span className={`w-2 h-2 rounded-full ${patient.status === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-teal-500'}`}></span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{patient.condition} • {patient.age} yrs • {patient.gender}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Risk Level</p>
                          <p className={`text-xs font-bold ${patient.status === 'critical' ? 'text-red-500' : 'text-teal-600'}`}>
                            {patient.status === 'critical' ? 'High Risk' : 'Stable'}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary-500 transition-all duration-300">
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">My Nursing Team</h2>
        </div>

        {doctorNurses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm animate-fade-up">
            <Activity className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Nurses Assigned</h3>
            <p className="text-slate-500">Contact the administrator to have nurses assigned to your team.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctorNurses.map(nurse => (
              <div
                key={nurse.id}
                onClick={() => setSelectedNurse(nurse)}
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-start gap-5 hover:shadow-xl hover:border-primary-100 transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150"></div>
                <img src={nurse.avatar} alt={nurse.name} className="w-20 h-20 rounded-[1.5rem] bg-slate-50 border-2 border-white shadow-md relative z-10" />
                <div className="relative z-10 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800 text-lg truncate pr-2 group-hover:text-primary-600 transition-colors">{nurse.name}</h4>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-all transform group-hover:translate-x-1" />
                  </div>
                  <p className="text-primary-600 font-bold text-[10px] uppercase tracking-wider mb-3">{nurse.department}</p>

                  <div className="space-y-1.5 mb-4">
                    <p className="text-slate-500 text-[11px] flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{nurse.email}</span>
                    </p>
                    <p className="text-slate-400 text-[11px] flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {nurse.phone || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                          {i}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Patients Assigned</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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
              <p className="text-slate-500 text-sm">Welcome, Dr. {user.name.split(' ')[1]}</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                {doctorAlerts.filter(a => !a.acknowledged).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="p-8">
          {activeTab === 'dashboard' && DashboardContent()}
          {activeTab === 'patients' && PatientsContent()}
          {activeTab === 'approvals' && ApprovalsContent()}
          {activeTab === 'nurses' && NursesContent()}
          {activeTab === 'alerts' && AlertsContent()}
          {activeTab === 'messages' && MessagesContent()}
          {activeTab === 'reports' && ReportsContent()}
        </main>
      </div>

      {/* Follow-up Plan Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl animate-scale-up border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {selectedPatient?.followUpPlan ? 'Update Plan' : 'Create Follow-Up Plan'}
                </h3>
                <p className="text-slate-500 mt-1 font-medium">Assign a structured care path for {selectedPatient?.name}</p>
              </div>
              <button
                onClick={() => setShowFollowUpModal(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl p-3 transition-all"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 ml-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={followUpData.name}
                  onChange={(e) => setFollowUpData({ ...followUpData, name: e.target.value })}
                  placeholder="e.g. Post-Surgery Cardiac Recovery"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 ml-1">Plan Description & Instructions</label>
                <textarea
                  required
                  rows="4"
                  value={followUpData.description}
                  onChange={(e) => setFollowUpData({ ...followUpData, description: e.target.value })}
                  placeholder="Enter detailed care instructions, medication rules, and recovery milestones..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={followUpData.startDate}
                      onChange={(e) => setFollowUpData({ ...followUpData, startDate: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">End Date (Optional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      value={followUpData.endDate}
                      onChange={(e) => setFollowUpData({ ...followUpData, endDate: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(false)}
                  className="flex-1 px-8 py-4 border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                >
                  {selectedPatient?.followUpPlan ? 'Update Plan' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorDashboard
