import { users, alerts, alertThresholds, getAlertColor, formatDateTime, formatDate } from '../data/mockData'
import {
  LayoutDashboard, Users, Settings, Bell, FileText,
  Activity, AlertTriangle, Shield, LogOut, ChevronRight,
  Heart, TrendingUp, Clock, CheckCircle, XCircle,
  Plus, Stethoscope, ArrowLeft, ChevronDown, UserCheck, Search, Save,
  User, Image, Lock
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addDoctor, saveUsers, vitalRecords, loadUsers, assignNurseToPatient,
  deactivatePatient, reactivatePatient, deletePatientPermanently
} from '../data/mockData'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const navigate = useNavigate()
  const [showCreateDoctor, setShowCreateDoctor] = useState(false)
  const [newDoctorData, setNewDoctorData] = useState({
    name: '',
    email: '',
    specialty: '',
    phone: '',
    license: '',
    password: '',
    confirmPassword: ''
  })
  const [localDoctors, setLocalDoctors] = useState(users.doctors)
  const [localNurses, setLocalNurses] = useState(users.nurses)
  const [localPatients, setLocalPatients] = useState(users.patients)
  const [selectedPendingUser, setSelectedPendingUser] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [selectedNurse, setSelectedNurse] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [notification, setNotification] = useState(null)
  const [showConfirmReject, setShowConfirmReject] = useState(false)
  const [localAlerts, setLocalAlerts] = useState(alerts)
  const [alertFilter, setAlertFilter] = useState('all') // 'all', 'critical', 'warning', 'acknowledged'
  const [selectedDoctorId, setSelectedDoctorId] = useState('') // Selection for patient assignment
  const [selectedNurseId, setSelectedNurseId] = useState('')
  const [systemSettings, setSystemSettings] = useState({
    name: localStorage.getItem('caretrack_system_name') || 'CareTrack',
    logo: null,
    timezone: 'UTC+5:30',
    language: 'English',
    maintenanceMode: localStorage.getItem('caretrack_maintenance') === 'true',
    alertsEnabled: localStorage.getItem('caretrack_alerts_enabled') !== 'false'
  });
  const [adminProfile, setAdminProfile] = useState(() => {
    const freshUsers = loadUsers();
    const adminData = freshUsers.admin || user;
    return {
      name: adminData.name || user.name,
      email: adminData.email || user.email,
      phone: adminData.phone || user.phone || '+1 555-0100',
      password: adminData.password || user.password || 'password123'
    };
  });
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('')
  const [nurseSearchQuery, setNurseSearchQuery] = useState('')
  const [patientSearchQuery, setPatientSearchQuery] = useState('')
  const [approvalDoctorSearch, setApprovalDoctorSearch] = useState('')
  const [approvalNurseSearch, setApprovalNurseSearch] = useState('')
  const [approvalPatientSearch, setApprovalPatientSearch] = useState('')

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'caretrack_users' || !e.key) {
        const freshUsers = loadUsers();
        setLocalDoctors([...freshUsers.doctors]);
        setLocalNurses([...freshUsers.nurses]);
        setLocalPatients([...freshUsers.patients]);
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [user.id])

  const handleAcknowledgeAlert = (alertId) => {
    const updatedAlerts = localAlerts.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    )
    setLocalAlerts(updatedAlerts)
    // In a real app, we'd persist this to a backend
    setNotification({ type: 'success', message: 'Alert acknowledged' })
    setTimeout(() => setNotification(null), 3000)
  }

  const stats = [
    { label: 'Total Patients', value: users.patients.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Alerts', value: alerts.filter(a => !a.acknowledged).length, icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Doctors', value: localDoctors.length, icon: Shield, color: 'bg-purple-500' },
    { label: 'Nurses', value: users.nurses.length, icon: Activity, color: 'bg-green-500' },
  ]

  const recentAlerts = alerts.slice(0, 5)
  const criticalPatients = users.patients.filter(p => p.status === 'critical')

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'approvals', label: 'Approvals', icon: UserCheck, badge: localDoctors.filter(d => !d.isApproved && !d.isRejected).length + localNurses.filter(n => !n.isApproved && !n.isRejected).length + localPatients.filter(p => p.registrationStatus === 'Pending').length },
    { id: 'nurses', label: 'Nurses', icon: Activity, alert: localNurses.filter(n => n.isApproved && !n.assignedDoctorId).length > 0 },
    { id: 'patients', label: 'Patients', icon: Users, alert: localPatients.filter(p => p.registrationStatus === 'Approved' && !p.doctorId).length > 0 },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const Sidebar = () => (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-slate-300 p-6 flex flex-col z-20">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold text-white tracking-tight block leading-tight">{systemSettings.name}</span>
          <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Admin Dashboard</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id)
              setSelectedPendingUser(null)
              setSelectedPatient(null)
              setSelectedNurse(null)
              setSelectedDoctor(null)
            }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${activeTab === item.id
              ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 font-semibold'
              : 'hover:bg-white/5 hover:text-white'}`}
          >
            <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-teal-400'}`} />
            <span className="text-sm">{item.label}</span>
            {item.badge > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-slate-900">
                {item.badge}
              </span>
            )}
            {item.alert && (
              <span className="absolute right-4 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
            )}
          </button>
        ))}
      </nav>

      <div className="pt-6 mt-6 border-t border-white/10">
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 mb-6 px-2 cursor-pointer hover:bg-white/5 p-2 rounded-2xl transition-all group"
        >
          <img src={user.avatar} alt={adminProfile.name} className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 ring-2 ring-transparent group-hover:ring-teal-500/50 transition-all" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm truncate group-hover:text-teal-400 transition-colors">{adminProfile.name}</p>
            <p className="text-xs text-slate-500 truncate">Administrator</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  )

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

      {/* Critical Patients */}
      {criticalPatients.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Critical Patients Requiring Attention</h3>
          </div>
          <div className="space-y-3">
            {criticalPatients.map((patient) => (
              <div key={patient.id} className="bg-white rounded-xl p-4 border border-red-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} alt={patient.name} className="w-10 h-10 rounded-full bg-red-100" />
                  <div>
                    <p className="font-medium text-slate-800">{patient.name}</p>
                    <p className="text-sm text-slate-500">{patient.condition}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  {patient.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Recent Alerts</h3>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-3">
            {recentAlerts.map((alert) => {
              const patient = users.patients.find(p => p.id === alert.patientId)
              return (
                <div key={alert.id} className={`p-4 rounded-xl border ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{patient?.name || 'Unknown Patient'}</p>
                      <p className="text-sm mt-1">{alert.message}</p>
                      <p className="text-xs mt-2 opacity-75">{formatDateTime(alert.timestamp)}</p>
                    </div>
                    {alert.acknowledged ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Alert Thresholds</h3>
          <div className="space-y-4">
            {Object.entries(alertThresholds).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-sm text-slate-500">Normal range: {value.min} - {value.max} {value.unit}</p>
                </div>
                <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                  <Settings className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Follow-up Plans removed */}
    </div>
  )

  const handleCreateDoctor = (e) => {
    e.preventDefault()

    if (newDoctorData.password !== newDoctorData.confirmPassword) {
      setNotification({ type: 'error', message: 'Passwords do not match' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const newDoc = addDoctor({
      name: `Dr. ${newDoctorData.name}`,
      email: newDoctorData.email,
      phone: newDoctorData.phone,
      specialty: newDoctorData.specialty,
      license: newDoctorData.license,
      password: newDoctorData.password
    })

    setLocalDoctors([...localDoctors, newDoc])
    setNewDoctorData({
      name: '', email: '', specialty: '',
      phone: '', license: '', password: '',
      confirmPassword: ''
    })
    setShowCreateDoctor(false)
    showSuccess(`Account created for Dr. ${newDoctorData.name}`)
  }

  const handleViewCertificate = (certificateData) => {
    if (!certificateData || certificateData.startsWith('MOCK_')) {
      alert('This is a mock user. No actual PDF was uploaded. Please register a new nurse to test real file uploads.');
      return;
    }

    try {
      // If it's a data URL, let's open it more reliably
      if (certificateData.startsWith('data:application/pdf;base64,')) {
        const base64Content = certificateData.split(',')[1];
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      } else {
        // Fallback for any other valid URL
        window.open(certificateData, '_blank');
      }
    } catch (error) {
      console.error('Error opening certificate:', error);
      alert('Failed to open the certificate. The file might be corrupted.');
    }
  };

  const showSuccess = (message) => {
    setNotification({ type: 'success', message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApproveDoctor = (doctorId) => {
    const fresh = loadUsers();
    const doctor = fresh.doctors.find(d => d.id === doctorId);
    if (doctor) {
      doctor.isApproved = true;
      doctor.isRejected = false;
      doctor.registrationStatus = 'Approved';
      localStorage.setItem('caretrack_users', JSON.stringify(fresh));
      Object.assign(users, fresh);
      window.dispatchEvent(new Event('storage'));
      setLocalDoctors([...fresh.doctors]);
      showSuccess(`${doctor.name} approved successfully`);
    }
  };

  const handleApproveNurse = (nurseId) => {
    const fresh = loadUsers();
    const nurse = fresh.nurses.find(n => n.id === nurseId);
    if (nurse) {
      nurse.isApproved = true;
      nurse.isRejected = false;
      nurse.registrationStatus = 'Approved';
      localStorage.setItem('caretrack_users', JSON.stringify(fresh));
      Object.assign(users, fresh);
      window.dispatchEvent(new Event('storage'));
      setLocalNurses([...fresh.nurses]);
      showSuccess(`${nurse.name} approved successfully`);
    }
  };

  const handleApprovePatient = (patientId, doctorId, nurseId) => {
    const fresh = loadUsers();
    const patient = fresh.patients.find(p => p.id === patientId);
    if (patient) {
      patient.isApproved = true;
      patient.isRejected = false;
      patient.registrationStatus = 'Approved';
      if (doctorId) {
        patient.doctorId = doctorId;
        const doctor = fresh.doctors.find(d => d.id === doctorId);
        if (doctor && !doctor.patients.includes(patientId)) {
          doctor.patients.push(patientId);
        }
      }
      if (nurseId) {
        assignNurseToPatient(patientId, nurseId);
      }
      localStorage.setItem('caretrack_users', JSON.stringify(fresh));
      Object.assign(users, fresh);
      window.dispatchEvent(new Event('storage'));
      setLocalPatients([...fresh.patients]);
      showSuccess(`${patient.name} approved and assigned successfully`);
    }
  };

  const handleAssignDoctorToPatient = (patientId, doctorId) => {
    const patient = users.patients.find(p => p.id === patientId);
    const doctor = users.doctors.find(d => d.id === doctorId);

    if (patient && doctor) {
      // Remove from old doctor if any
      if (patient.doctorId) {
        const oldDoc = users.doctors.find(d => d.id === patient.doctorId);
        if (oldDoc) {
          oldDoc.patients = oldDoc.patients.filter(id => id !== patientId);
        }
      }

      patient.doctorId = doctorId;
      if (!doctor.patients.includes(patientId)) {
        doctor.patients.push(patientId);
      }
      saveUsers();
      setLocalPatients([...users.patients]);
      setLocalDoctors([...users.doctors]);
      showSuccess(`${patient.name} assigned to ${doctor.name}`);
    }
  };

  const handleAssignDoctorToNurse = (nurseId, doctorId) => {
    const nurse = users.nurses.find(n => n.id === nurseId);
    const doctor = users.doctors.find(d => d.id === doctorId);

    if (nurse && doctor) {
      nurse.assignedDoctorId = doctorId;
      saveUsers();
      setLocalNurses([...users.nurses]);
      showSuccess(`${nurse.name} assigned to ${doctor.name}`);
    }
  };

  const handleRejectDoctor = (doctorId) => {
    const fresh = loadUsers();
    const doctor = fresh.doctors.find(d => d.id === doctorId);
    if (doctor) {
      const name = doctor.name;
      doctor.isApproved = false;
      doctor.isRejected = true;
      doctor.registrationStatus = 'Rejected';
      localStorage.setItem('caretrack_users', JSON.stringify(fresh));
      Object.assign(users, fresh);
      window.dispatchEvent(new Event('storage'));
      setLocalDoctors([...fresh.doctors]);
      showSuccess(`${name} rejected`);
    }
  };

  const handleRejectNurse = (nurseId) => {
    const fresh = loadUsers();
    const nurse = fresh.nurses.find(n => n.id === nurseId);
    if (nurse) {
      const name = nurse.name;
      nurse.isApproved = false;
      nurse.isRejected = true;
      nurse.registrationStatus = 'Rejected';
      localStorage.setItem('caretrack_users', JSON.stringify(fresh));
      Object.assign(users, fresh);
      window.dispatchEvent(new Event('storage'));
      setLocalNurses([...fresh.nurses]);
      showSuccess(`${name} rejected`);
    }
  };

  const handleRejectPatient = (patientId) => {
    const fresh = loadUsers();
    const patient = fresh.patients.find(p => p.id === patientId);
    if (patient) {
      const name = patient.name;
      patient.isApproved = false;
      patient.isRejected = true;
      patient.registrationStatus = 'Rejected';
      localStorage.setItem('caretrack_users', JSON.stringify(fresh));
      Object.assign(users, fresh);
      window.dispatchEvent(new Event('storage'));
      setLocalPatients([...fresh.patients]);
      showSuccess(`${name} rejected`);
    }
  };

  const handleDeactivatePatient = (patientId) => {
    if (window.confirm("Are you sure you want to deactivate this patient's account? They will no longer be able to log in.")) {
      if (deactivatePatient(patientId)) {
        setLocalPatients([...users.patients]);
        showSuccess("Patient account deactivated");
        if (selectedPatient?.id === patientId) setSelectedPatient(null);
      }
    }
  };

  const handleReactivatePatient = (patientId) => {
    if (reactivatePatient(patientId)) {
      setLocalPatients([...users.patients]);
      showSuccess("Patient account reactivated");
      if (selectedPatient?.id === patientId) {
        const updated = users.patients.find(p => p.id === patientId);
        setSelectedPatient(updated);
      }
    }
  };

  const handleDeletePatient = (patientId) => {
    if (window.confirm("CRITICAL ACTION: Are you sure you want to PERMANENTLY DELETE this patient record? This action CANNOT be undone and all clinical history will be lost.")) {
      if (deletePatientPermanently(patientId)) {
        setLocalPatients([...users.patients]);
        showSuccess("Patient record deleted permanently");
        if (selectedPatient?.id === patientId) setSelectedPatient(null);
      }
    }
  };

  const NotificationToast = () => (
    <div className={`fixed bottom-8 right-8 z-50 animate-fade-in`}>
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${notification.type === 'success' ? 'bg-teal-50 border-teal-100 text-teal-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
        {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        <span className="font-bold">{notification.message}</span>
      </div>
    </div>
  );

  // ConfirmationModal is defined at module scope below — accessible by ApprovalsContent




  const AlertsContent = () => {
    const filteredAlerts = localAlerts.filter(alert => {
      if (alertFilter === 'critical') return alert.type === 'critical' && !alert.acknowledged
      if (alertFilter === 'warning') return alert.type === 'warning' && !alert.acknowledged
      if (alertFilter === 'acknowledged') return alert.acknowledged
      return !alert.acknowledged
    })

    const stats = {
      total: localAlerts.length,
      pendingCritical: localAlerts.filter(a => a.type === 'critical' && !a.acknowledged).length,
      pendingWarning: localAlerts.filter(a => a.type === 'warning' && !a.acknowledged).length,
      acknowledged: localAlerts.filter(a => a.acknowledged).length
    }

    return (
      <div className="space-y-6 animate-fade-up">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Alerts', value: stats.total, color: 'text-slate-600', bg: 'bg-slate-100' },
            { label: 'Pending Critical', value: stats.pendingCritical, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Pending Warnings', value: stats.pendingWarning, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Acknowledged', value: stats.acknowledged, color: 'text-teal-600', bg: 'bg-teal-50' }
          ].map((s, idx) => (
            <div key={idx} className={`${s.bg} p-4 rounded-2xl border border-white/50 shadow-sm transition-all hover:scale-[1.02]`}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[600px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">System Alerts</h3>
              <p className="text-slate-500 font-medium">Monitoring patient safety and system events</p>
            </div>

            <div className="flex p-1 bg-slate-100 rounded-xl">
              {[
                { id: 'all', label: 'All Pending' },
                { id: 'critical', label: 'Critical' },
                { id: 'warning', label: 'Warnings' },
                { id: 'acknowledged', label: 'History' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAlertFilter(tab.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${alertFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map(alert => {
                const patient = users.patients.find(p => p.id === alert.patientId)
                return (
                  <div
                    key={alert.id}
                    className={`group p-5 rounded-2xl border transition-all duration-300 hover:shadow-md ${alert.acknowledged
                        ? 'bg-slate-50/50 border-slate-100 opacity-75'
                        : alert.type === 'critical'
                          ? 'bg-red-50/30 border-red-100 hover:bg-red-50/50'
                          : 'bg-amber-50/30 border-amber-100 hover:bg-amber-50/50'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={patient?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${alert.patientId}`}
                          className="w-12 h-12 rounded-xl bg-white shadow-sm"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${alert.type === 'critical' ? 'bg-red-500' : alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                          }`}>
                          <AlertTriangle className="w-2 h-2 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-slate-800">{patient?.name || 'Unknown Patient'}</h4>
                          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">
                            {formatDateTime(alert.timestamp)}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed mb-3">{alert.message}</p>

                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${alert.type === 'critical'
                              ? 'bg-red-100 text-red-600'
                              : alert.type === 'warning'
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                            {alert.type}
                          </span>
                          {!alert.acknowledged && (
                            <button
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                              className="text-[10px] font-bold text-teal-600 hover:text-teal-700 underline underline-offset-4 decoration-2 transition-all"
                            >
                              Mark as Acknowledged
                            </button>
                          )}
                          {alert.acknowledged && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-teal-600">
                              <CheckCircle className="w-3 h-3" />
                              Acknowledged
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Shield className="w-10 h-10 text-slate-200" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Clear Skies!</h4>
                <p className="text-slate-500 max-w-xs mx-auto">No alerts match your current filter. All systems functioning within normal parameters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const SettingsContent = () => {
    const [localProfile, setLocalProfile] = useState(adminProfile);
    const [localSystem, setLocalSystem] = useState(systemSettings);
    const [isSaving, setIsSaving] = useState(false);

    // Password change state
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [pwdData, setPwdData] = useState({ current: '', new: '', confirm: '' });
    const [pwdError, setPwdError] = useState('');

    const handleUpdatePassword = () => {
      setPwdError('');

      const currentInput = pwdData.current.trim();
      const newPwd = pwdData.new.trim();
      const confirmPwd = pwdData.confirm.trim();

      // Get fresh data for verification
      const freshData = loadUsers();
      const storedPassword = freshData.admin?.password || adminProfile.password || user.password || 'password123';

      // Check against stored password OR system default
      if (currentInput !== storedPassword && currentInput !== 'password123') {
        setPwdError('Current password is incorrect');
        return;
      }

      if (newPwd !== confirmPwd) {
        setPwdError('New passwords do not match');
        return;
      }

      if (newPwd.length < 8) {
        setPwdError('Password must be at least 8 characters');
        return;
      }

      // Update states
      const updatedProfile = { ...localProfile, password: newPwd };
      setAdminProfile(updatedProfile);
      setLocalProfile(updatedProfile);

      // Persist to localStorage
      const freshUsers = loadUsers();
      freshUsers.admin = { ...freshUsers.admin, password: newPwd };
      localStorage.setItem('caretrack_users', JSON.stringify(freshUsers));

      setIsChangingPassword(false);
      setPwdData({ current: '', new: '', confirm: '' });
      setNotification({ type: 'success', message: 'Password updated successfully!' });
      setTimeout(() => setNotification(null), 3000);
    };

    const handleSaveSettings = () => {
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        setAdminProfile(localProfile);
        setSystemSettings(localSystem);

        // Persist profile changes and maintenance mode to localStorage
        const freshUsers = loadUsers();
        freshUsers.admin = { ...freshUsers.admin, ...localProfile };
        localStorage.setItem('caretrack_users', JSON.stringify(freshUsers));
        localStorage.setItem('caretrack_maintenance', localSystem.maintenanceMode ? 'true' : 'false');
        localStorage.setItem('caretrack_alerts_enabled', localSystem.alertsEnabled ? 'true' : 'false');
        localStorage.setItem('caretrack_system_name', localSystem.name);

        window.dispatchEvent(new Event('storage')); // Trigger cross-tab sync

        setNotification({ type: 'success', message: 'Settings updated successfully' });
        setTimeout(() => setNotification(null), 3000);
      }, 1000);
    };

    return (
      <div className="space-y-8 animate-fade-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">System Settings</h3>
            <p className="text-slate-500 font-medium">Manage administrative profile and global system behavior</p>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-8 py-4 bg-teal-500 text-white rounded-[2rem] font-bold hover:bg-teal-600 transition-all shadow-xl shadow-teal-500/20 flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{isSaving ? 'Applying Changes...' : 'Save All Settings'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Settings */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-teal-50 rounded-2xl">
                <User className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-800">Profile Settings</h4>
                <p className="text-sm text-slate-400 font-medium">Basic administrator details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                <input
                  type="text"
                  value={localProfile.name}
                  onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Address</label>
                <input
                  type="email"
                  value={localProfile.email}
                  onChange={(e) => setLocalProfile({ ...localProfile, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Phone Number</label>
                <input
                  type="text"
                  value={localProfile.phone}
                  onChange={(e) => setLocalProfile({ ...localProfile, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none"
                />
              </div>
              <div className="space-y-1.5 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Account Security</label>
                  {!isChangingPassword && (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="text-[10px] font-black text-teal-600 uppercase tracking-widest hover:text-teal-700 transition-colors"
                    >
                      Change Password
                    </button>
                  )}
                </div>

                {isChangingPassword ? (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-fade-in">
                    <div>
                      <input
                        type="password"
                        placeholder="Current Password"
                        value={pwdData.current}
                        onChange={(e) => setPwdData({ ...pwdData, current: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-teal-500 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="password"
                        placeholder="New Password"
                        value={pwdData.new}
                        onChange={(e) => setPwdData({ ...pwdData, new: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-teal-500 outline-none transition-all"
                      />
                      <input
                        type="password"
                        placeholder="Confirm New"
                        value={pwdData.confirm}
                        onChange={(e) => setPwdData({ ...pwdData, confirm: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-teal-500 outline-none transition-all"
                      />
                    </div>
                    {pwdError && <p className="text-[10px] text-red-500 font-bold ml-1">{pwdError}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdatePassword}
                        className="flex-1 py-2.5 bg-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-600 transition-all"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => { setIsChangingPassword(false); setPwdError(''); }}
                        className="px-4 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-2xl border border-slate-50 text-slate-400">
                    <span className="text-sm font-bold tracking-widest">••••••••••••</span>
                    <Lock className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-800">System Controls</h4>
                <p className="text-sm text-slate-400 font-medium">Global behavior and branding</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">System Name</label>
                <input
                  type="text"
                  value={localSystem.name}
                  onChange={(e) => setLocalSystem({ ...localSystem, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Branding Logo</label>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-teal-300 transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Image className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-600">Click to upload new logo</p>
                    <p className="text-[10px] text-slate-400 font-medium">Recommended: SVG or PNG (Max 2MB)</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Time Zone</label>
                  <div className="relative">
                    <select
                      value={localSystem.timezone}
                      onChange={(e) => setLocalSystem({ ...localSystem, timezone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none appearance-none"
                    >
                      <option value="UTC+5:30">UTC+5:30 (India)</option>
                      <option value="UTC+0:00">UTC+0:00 (London)</option>
                      <option value="UTC-5:00">UTC-5:00 (New York)</option>
                    </select>
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className={`pt-6 border-t border-slate-50 flex items-center justify-between relative group transition-all duration-300 p-4 rounded-2xl ${localSystem.maintenanceMode ? 'bg-red-50 border border-red-100' : 'hover:bg-slate-50'}`}>
                <div>
                  <h5 className={`font-bold text-sm transition-colors ${localSystem.maintenanceMode ? 'text-red-700' : 'text-slate-800'}`}>Maintenance Mode</h5>
                  <p className="text-[10px] text-slate-400 font-medium">Suspend system access for routine updates</p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Tooltip */}
                  <div className="invisible group-hover:visible absolute right-20 bottom-full mb-2 bg-slate-900 text-white text-[11px] p-4 rounded-2xl w-72 shadow-2xl z-20 pointer-events-none transition-all duration-200 opacity-0 group-hover:opacity-100 border border-white/10">
                    <p className="font-bold mb-2 text-red-400 uppercase tracking-wider text-[10px]">Maintenance Mode Impact</p>
                    <div className="space-y-2 text-slate-300 leading-relaxed text-left">
                      <p>When enabled, all patients, doctors, and nurses will be redirected to a maintenance page and cannot access system features.</p>
                      <p>Administrators retain full access to manage data and settings during this period.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setLocalSystem({ ...localSystem, maintenanceMode: !localSystem.maintenanceMode })}
                    className={`w-14 h-7 rounded-full p-1 transition-all duration-300 relative shadow-inner ${localSystem.maintenanceMode ? 'bg-red-500' : 'bg-slate-200'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 transform ${localSystem.maintenanceMode ? 'translate-x-7' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Alert & Notification Settings */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6 lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-50 rounded-2xl">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-800">Alert & Notification Settings</h4>
                <p className="text-sm text-slate-400 font-medium">Control system-wide communication and alerts</p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between relative group">
              <div>
                <h5 className="font-bold text-slate-800">Enable System-wide Alerts</h5>
                <p className="text-xs text-slate-400 font-medium">Master control for automated notifications and reminders</p>
              </div>

              <div className="flex items-center gap-4">
                {/* Tooltip */}
                <div className="invisible group-hover:visible absolute right-20 bottom-full mb-2 bg-slate-900 text-white text-[11px] p-4 rounded-2xl w-72 shadow-2xl z-20 pointer-events-none transition-all duration-200 opacity-0 group-hover:opacity-100 border border-white/10">
                  <p className="font-bold mb-2 text-teal-400 uppercase tracking-wider text-[10px]">Impact of Disabling Notifications</p>
                  <div className="space-y-2 text-slate-300 leading-relaxed">
                    <p>When disabled, the system will not send automated health alerts to doctors or nurses, and patients will not receive follow-up or submission reminders.</p>
                    <p>System updates, prescription notices, and approval status notifications will also be paused. Clinical data monitoring remains active for manual review.</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 text-[9px] text-slate-500 italic">
                    Note: Only automated delivery is affected; all other system functions remain normal.
                  </div>
                </div>

                <button
                  onClick={() => setLocalSystem({ ...localSystem, alertsEnabled: !localSystem.alertsEnabled })}
                  className={`w-14 h-7 rounded-full p-1 transition-all duration-300 relative shadow-inner ${localSystem.alertsEnabled ? 'bg-teal-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 transform ${localSystem.alertsEnabled ? 'translate-x-7' : 'translate-x-0'}`}></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 capitalize">
                {activeTab}
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-slate-500 text-sm font-medium">Welcome back, {adminProfile.name} (Admin)</p>
                {systemSettings.maintenanceMode && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    Maintenance Mode Active
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2.5 hover:bg-slate-100 rounded-2xl transition-all active:scale-95 group">
                <Bell className="w-6 h-6 text-slate-500 group-hover:text-teal-600 transition-colors" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-500/20"></span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-8 pb-20">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'doctors' && (
            <DoctorsContent
              localDoctors={localDoctors}
              doctorSearchQuery={doctorSearchQuery}
              setDoctorSearchQuery={setDoctorSearchQuery}
              showCreateDoctor={showCreateDoctor}
              setShowCreateDoctor={setShowCreateDoctor}
              newDoctorData={newDoctorData}
              setNewDoctorData={setNewDoctorData}
              handleCreateDoctor={handleCreateDoctor}
              selectedDoctor={selectedDoctor}
              setSelectedDoctor={setSelectedDoctor}
              handleViewCertificate={handleViewCertificate}
            />
          )}
          {activeTab === 'approvals' && (
            <ApprovalsContent
              localDoctors={localDoctors}
              localNurses={localNurses}
              localPatients={localPatients}
              selectedPendingUser={selectedPendingUser}
              setSelectedPendingUser={setSelectedPendingUser}
              showConfirmReject={showConfirmReject}
              setShowConfirmReject={setShowConfirmReject}
              selectedDoctorId={selectedDoctorId}
              setSelectedDoctorId={setSelectedDoctorId}
              selectedNurseId={selectedNurseId}
              setSelectedNurseId={setSelectedNurseId}
              handleApproveDoctor={handleApproveDoctor}
              handleApproveNurse={handleApproveNurse}
              handleApprovePatient={handleApprovePatient}
              handleRejectDoctor={handleRejectDoctor}
              handleRejectNurse={handleRejectNurse}
              handleRejectPatient={handleRejectPatient}
              handleViewCertificate={handleViewCertificate}
              approvalDoctorSearch={approvalDoctorSearch}
              setApprovalDoctorSearch={setApprovalDoctorSearch}
              approvalNurseSearch={approvalNurseSearch}
              setApprovalNurseSearch={setApprovalNurseSearch}
              approvalPatientSearch={approvalPatientSearch}
              setApprovalPatientSearch={setApprovalPatientSearch}
            />
          )}
          {activeTab === 'nurses' && (
            <NursesContent
              localNurses={localNurses}
              localDoctors={localDoctors}
              nurseSearchQuery={nurseSearchQuery}
              setNurseSearchQuery={setNurseSearchQuery}
              selectedNurse={selectedNurse}
              setSelectedNurse={setSelectedNurse}
              handleAssignDoctorToNurse={handleAssignDoctorToNurse}
              handleViewCertificate={handleViewCertificate}
              formatDate={formatDate}
            />
          )}
          {activeTab === 'patients' && (
            <PatientsContent
              localPatients={localPatients}
              localDoctors={localDoctors}
              patientSearchQuery={patientSearchQuery}
              setPatientSearchQuery={setPatientSearchQuery}
              selectedPatient={selectedPatient}
              setSelectedPatient={setSelectedPatient}
              handleAssignDoctorToPatient={handleAssignDoctorToPatient}
              selectedNurseId={selectedNurseId}
              setSelectedNurseId={setSelectedNurseId}
              assignNurseToPatient={assignNurseToPatient}
              setLocalPatients={setLocalPatients}
              setLocalNurses={setLocalNurses}
              showSuccess={showSuccess}
              formatDateTime={formatDateTime}
              formatDate={formatDate}
              users={users}
              handleDeactivatePatient={handleDeactivatePatient}
              handleReactivatePatient={handleReactivatePatient}
              handleDeletePatient={handleDeletePatient}
            />
          )}
          {activeTab === 'alerts' && <AlertsContent />}
          {activeTab === 'reports' && (
            <ReportsContent
              user={user}
              localDoctors={localDoctors}
              localPatients={localPatients}
              alerts={alerts}
              setNotification={setNotification}
              vitalRecords={vitalRecords}
              formatDateTime={formatDateTime}
              systemSettings={systemSettings}
            />
          )}
          {activeTab === 'settings' && <SettingsContent />}
        </main>
        {notification && <NotificationToast />}
      </div>
    </div>
  );
};

const ConfirmationModal = ({ onConfirm, onCancel, title, message }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
      <div className="flex items-center gap-4 text-red-600">
        <div className="p-3 bg-red-50 rounded-2xl">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold">{title}</h3>
      </div>
      <p className="text-slate-600 leading-relaxed">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
        >
          Yes, Reject
        </button>
      </div>
    </div>
  </div>
);

const ApprovalsContent = ({
  localDoctors,
  localNurses,
  localPatients,
  selectedPendingUser,
  setSelectedPendingUser,
  showConfirmReject,
  setShowConfirmReject,
  selectedDoctorId,
  setSelectedDoctorId,
  selectedNurseId,
  setSelectedNurseId,
  handleApproveDoctor,
  handleApproveNurse,
  handleApprovePatient,
  handleRejectDoctor,
  handleRejectNurse,
  handleRejectPatient,
  handleViewCertificate,
  approvalDoctorSearch,
  setApprovalDoctorSearch,
  approvalNurseSearch,
  setApprovalNurseSearch,
  approvalPatientSearch,
  setApprovalPatientSearch
}) => {
  const pendingDoctors = localDoctors.filter(d =>
    !d.isApproved && !d.isRejected &&
    (d.name.toLowerCase().includes(approvalDoctorSearch.toLowerCase()) ||
      d.specialty?.toLowerCase().includes(approvalDoctorSearch.toLowerCase()) ||
      d.email.toLowerCase().includes(approvalDoctorSearch.toLowerCase()))
  );

  const pendingNurses = localNurses.filter(n =>
    !n.isApproved && !n.isRejected &&
    (n.name.toLowerCase().includes(approvalNurseSearch.toLowerCase()) ||
      n.department?.toLowerCase().includes(approvalNurseSearch.toLowerCase()) ||
      n.email.toLowerCase().includes(approvalNurseSearch.toLowerCase()))
  );

  const pendingPatients = localPatients.filter(p =>
    p.registrationStatus === 'Pending' &&
    (p.name.toLowerCase().includes(approvalPatientSearch.toLowerCase()) ||
      p.condition?.toLowerCase().includes(approvalPatientSearch.toLowerCase()) ||
      p.email.toLowerCase().includes(approvalPatientSearch.toLowerCase()))
  );

  if (selectedPendingUser) {
    return (
      <div className="space-y-6 animate-fade-up">
        <button
          onClick={() => setSelectedPendingUser(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <img src={selectedPendingUser.avatar} alt={selectedPendingUser.name} className="w-32 h-32 rounded-3xl bg-slate-100 shadow-inner" />
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-3xl font-bold text-slate-900">{selectedPendingUser.name}</h3>
                <p className="text-lg text-primary-600 font-medium capitalize">{selectedPendingUser.role}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Email Address</p>
                  <p className="text-slate-700 font-medium">{selectedPendingUser.email}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Phone Number</p>
                  <p className="text-slate-700 font-medium">{selectedPendingUser.phone || 'N/A'}</p>
                </div>
                {selectedPendingUser.role === 'doctor' && (
                  <>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Department</p>
                      <p className="text-slate-700 font-medium">{selectedPendingUser.department}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Qualification</p>
                      <p className="text-slate-700 font-medium">{selectedPendingUser.qualification || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Medical Registration</p>
                      <p className="text-slate-700 font-medium">{selectedPendingUser.medicalRegistrationNumber || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Registered At</p>
                      <p className="text-slate-700 font-medium">
                        {selectedPendingUser.registeredAt ? new Date(selectedPendingUser.registeredAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl md:col-span-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-teal-600" />
                        <div>
                          <p className="text-xs text-teal-600 font-bold uppercase tracking-wider">Qualification Certificate</p>
                          <p className="text-slate-700 text-sm font-medium">doctor_credential_verification.pdf</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewCertificate(selectedPendingUser.qualificationCertificate)}
                        className={`${!selectedPendingUser.qualificationCertificate ? 'opacity-50 cursor-not-allowed' : ''} px-4 py-2 bg-white text-teal-600 border border-teal-200 rounded-xl text-xs font-bold hover:bg-teal-50 transition-colors`}
                      >
                        View PDF
                      </button>
                    </div>
                  </>
                )}
                {selectedPendingUser.role === 'nurse' && (
                  <>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Department</p>
                      <p className="text-slate-700 font-medium">{selectedPendingUser.department}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Qualification</p>
                      <p className="text-slate-700 font-medium">{selectedPendingUser.qualification || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">KNMC Registration</p>
                      <p className="text-slate-700 font-medium">{selectedPendingUser.knmcRegistrationNumber || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Registered At</p>
                      <p className="text-slate-700 font-medium">
                        {selectedPendingUser.registeredAt ? new Date(selectedPendingUser.registeredAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl md:col-span-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-teal-600" />
                        <div>
                          <p className="text-xs text-teal-600 font-bold uppercase tracking-wider">Qualification Certificate</p>
                          <p className="text-slate-700 text-sm font-medium">nurse_credential_verification.pdf</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewCertificate(selectedPendingUser.qualificationCertificate)}
                        className={`${!selectedPendingUser.qualificationCertificate ? 'opacity-50 cursor-not-allowed' : ''} px-4 py-2 bg-white text-teal-600 border border-teal-200 rounded-xl text-xs font-bold hover:bg-teal-50 transition-colors`}
                      >
                        View PDF
                      </button>
                    </div>
                  </>
                )}
                {selectedPendingUser.role === 'patient' && (
                  <>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Condition</p>
                      <p className="text-slate-700 font-medium">{selectedPendingUser.condition || 'General'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Age / Gender</p>
                      <p className="text-slate-700 font-medium">{selectedPendingUser.age} • {selectedPendingUser.gender}</p>
                    </div>

                  </>
                )}
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  onClick={() => {
                    if (selectedPendingUser.role === 'doctor') handleApproveDoctor(selectedPendingUser.id);
                    else if (selectedPendingUser.role === 'nurse') handleApproveNurse(selectedPendingUser.id);
                    else {
                      handleApprovePatient(selectedPendingUser.id, null, null);
                    }
                    setSelectedPendingUser(null);
                    setSelectedDoctorId('');
                    setSelectedNurseId('');
                  }}
                  className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all flex items-center gap-2 shadow-lg shadow-teal-600/20"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve User
                </button>
                <button
                  onClick={() => {
                    setShowConfirmReject(true);
                  }}
                  className="px-8 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl font-bold transition-all flex items-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>

        {showConfirmReject && (
          <ConfirmationModal
            title="Reject Application?"
            message={`Are you sure you want to reject ${selectedPendingUser.name}? this action cannot be undone and will remove their registration request from the system.`}
            onConfirm={() => {
              const id = selectedPendingUser.id;
              const role = selectedPendingUser.role;
              if (role === 'doctor') handleRejectDoctor(id);
              else if (role === 'nurse') handleRejectNurse(id);
              else handleRejectPatient(id);
              setSelectedPendingUser(null);
              setShowConfirmReject(false);
            }}
            onCancel={() => setShowConfirmReject(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Pending Doctors */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            <h3 className="text-xl font-bold text-slate-800">Doctor Approvals</h3>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search pending doctors..."
              value={approvalDoctorSearch}
              onChange={(e) => setApprovalDoctorSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            />
          </div>
        </div>
        {pendingDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 italic text-slate-400">
            {approvalDoctorSearch ? 'No pending doctors match your search.' : 'No pending doctor requests.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingDoctors.map(doctor => (
              <div key={doctor.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={doctor.avatar} alt={doctor.name} className="w-12 h-12 rounded-full bg-slate-100" />
                  <div>
                    <p className="font-bold text-slate-900">{doctor.name}</p>
                    <p className="text-xs text-slate-500">{doctor.specialty} • {doctor.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPendingUser(doctor)}
                  className="px-4 py-2 bg-slate-100 text-primary-600 rounded-xl text-sm font-bold hover:bg-primary-500 hover:text-white transition-all flex items-center gap-2"
                >
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Nurses */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <h3 className="text-xl font-bold text-slate-800">Nurse Approvals</h3>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search pending nurses..."
              value={approvalNurseSearch}
              onChange={(e) => setApprovalNurseSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            />
          </div>
        </div>
        {pendingNurses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 italic text-slate-400">
            {approvalNurseSearch ? 'No pending nurses match your search.' : 'No pending nurse requests.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingNurses.map(nurse => (
              <div key={nurse.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={nurse.avatar} alt={nurse.name} className="w-12 h-12 rounded-full bg-slate-100" />
                  <div>
                    <p className="font-bold text-slate-900">{nurse.name}</p>
                    <p className="text-xs text-slate-500">{nurse.department} • {nurse.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPendingUser(nurse)}
                  className="px-4 py-2 bg-slate-100 text-primary-600 rounded-xl text-sm font-bold hover:bg-primary-500 hover:text-white transition-all flex items-center gap-2"
                >
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Patients */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-800">Patient Approvals</h3>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search pending patients..."
              value={approvalPatientSearch}
              onChange={(e) => setApprovalPatientSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            />
          </div>
        </div>
        {pendingPatients.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 italic text-slate-400">
            {approvalPatientSearch ? 'No pending patients match your search.' : 'No pending patient requests.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingPatients.map(patient => (
              <div key={patient.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={patient.avatar} alt={patient.name} className="w-12 h-12 rounded-full bg-slate-100" />
                  <div>
                    <p className="font-bold text-slate-900">{patient.name}</p>
                    <p className="text-xs text-slate-500">{patient.condition || 'General'} • {patient.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPendingUser(patient)}
                  className="px-4 py-2 bg-slate-100 text-primary-600 rounded-xl text-sm font-bold hover:bg-primary-500 hover:text-white transition-all flex items-center gap-2"
                >
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const NursesContent = ({
  localNurses,
  localDoctors,
  nurseSearchQuery,
  setNurseSearchQuery,
  selectedNurse,
  setSelectedNurse,
  handleAssignDoctorToNurse,
  handleViewCertificate,
  formatDate
}) => {
  const approvedNurses = localNurses.filter(n =>
    n.isApproved &&
    (n.name.toLowerCase().includes(nurseSearchQuery.toLowerCase()) ||
      n.department?.toLowerCase().includes(nurseSearchQuery.toLowerCase()) ||
      n.email.toLowerCase().includes(nurseSearchQuery.toLowerCase()))
  );
  const approvedDoctors = localDoctors.filter(d => d.isApproved);

  if (selectedNurse) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedNurse(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex flex-col items-center gap-4">
              <img
                src={selectedNurse.avatar}
                alt={selectedNurse.name}
                className="w-40 h-40 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-xl"
              />
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900">{selectedNurse.name}</h3>
                <div className="flex items-center gap-2 mt-2 justify-center">
                  <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-bold uppercase tracking-wider">
                    {selectedNurse.department}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mb-2">Email Address</p>
                  <p className="text-slate-700 font-semibold">{selectedNurse.email}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mb-2">Phone Number</p>
                  <p className="text-slate-700 font-semibold">{selectedNurse.phone}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mb-2">Qualification</p>
                  <p className="text-slate-700 font-semibold">{selectedNurse.qualification || 'N/A'}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mb-2">KNMC Registration</p>
                  <p className="text-slate-700 font-semibold">{selectedNurse.knmcRegistrationNumber || 'N/A'}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50 md:col-span-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mb-2">Qualification Certificate</p>
                  <div className="mt-2 flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary-500" />
                      <span className="text-sm text-slate-600 font-medium">certificate.pdf</span>
                    </div>
                    <button
                      onClick={() => handleViewCertificate(selectedNurse.qualificationCertificate)}
                      className="text-primary-600 text-xs font-bold hover:underline bg-transparent border-0 p-0 cursor-pointer"
                    >
                      View Certificate
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl"></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mb-3 relative z-10">Registration Details</p>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-slate-400 text-sm">Registered On</p>
                    <p className="text-lg font-bold">{formatDate ? formatDate(selectedNurse.registeredAt) : selectedNurse.registeredAt.split('T')[0]}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-slate-50 rounded-2xl p-6 space-y-4 shadow-sm">
                <div>
                  <h4 className="font-bold text-slate-900">Assign Supervising Doctor</h4>
                  <p className="text-sm text-slate-500 mt-1">Select a clinician to supervise this nurse's assigned patients.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <select
                      className="w-full pl-5 pr-10 py-4 bg-slate-50 border-2 border-transparent focus:border-primary-500 rounded-2xl appearance-none transition-all font-semibold text-slate-700"
                      defaultValue={selectedNurse.assignedDoctorId || ""}
                      onChange={(e) => {
                        const docId = parseInt(e.target.value);
                        if (docId) handleAssignDoctorToNurse(selectedNurse.id, docId);
                      }}
                    >
                      <option value="">Choose a Doctor...</option>
                      {approvedDoctors.map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Nurse Management</h3>
          <p className="text-slate-500 mt-1">Review and assign doctors to nursing staff.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search nurses by name, department, or email..."
          value={nurseSearchQuery}
          onChange={(e) => setNurseSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium shadow-sm"
        />
      </div>

      <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nurse</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered At</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {approvedNurses.map(nurse => (
              <tr key={nurse.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={nurse.avatar} alt={nurse.name} className="w-10 h-10 rounded-xl bg-slate-100" />
                    <div>
                      <p className="font-bold text-slate-800">{nurse.name}</p>
                      <p className="text-xs text-slate-500">{nurse.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {nurse.department}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {formatDate ? formatDate(nurse.registeredAt) : nurse.registeredAt.split('T')[0]}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedNurse(nurse)}
                    className="px-4 py-2 bg-slate-100 text-primary-600 rounded-xl text-xs font-bold hover:bg-primary-500 hover:text-white transition-all flex items-center gap-2 ml-auto"
                  >
                    Management
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {approvedNurses.length === 0 && (
          <div className="py-20 text-center text-slate-400 italic">
            {nurseSearchQuery ? 'No nurses match your search.' : 'No approved nurses found in the system.'}
          </div>
        )}
      </div>
    </div>
  );
};

const DoctorsContent = ({
  localDoctors,
  doctorSearchQuery,
  setDoctorSearchQuery,
  showCreateDoctor,
  setShowCreateDoctor,
  newDoctorData,
  setNewDoctorData,
  handleCreateDoctor,
  selectedDoctor,
  setSelectedDoctor,
  handleViewCertificate
}) => {
  // Filter approved doctors based on search query
  const approvedDoctors = localDoctors.filter(d =>
    d.isApproved &&
    (d.name.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
      d.specialty.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(doctorSearchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-800">Doctor Management</h3>
        <button
          onClick={() => setShowCreateDoctor(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Doctor
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search doctors by name, specialty, or email..."
          value={doctorSearchQuery}
          onChange={(e) => setDoctorSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium shadow-sm"
        />
      </div>

      {showCreateDoctor && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">New Doctor Account</h4>
          <form onSubmit={handleCreateDoctor} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name (without Dr. prefix)</label>
                <input
                  type="text"
                  required
                  value={newDoctorData.name}
                  onChange={e => setNewDoctorData({ ...newDoctorData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                  placeholder="e.g. James Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={newDoctorData.email}
                  onChange={e => setNewDoctorData({ ...newDoctorData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                  placeholder="doctor@caretrack.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={newDoctorData.phone}
                  onChange={e => setNewDoctorData({ ...newDoctorData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                  placeholder="e.g. +1 234 567 890"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Specialty</label>
                <input
                  type="text"
                  required
                  value={newDoctorData.specialty}
                  onChange={e => setNewDoctorData({ ...newDoctorData, specialty: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                  placeholder="e.g. Neurology"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Medical License Number</label>
                <input
                  type="text"
                  required
                  value={newDoctorData.license}
                  onChange={e => setNewDoctorData({ ...newDoctorData, license: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                  placeholder="e.g. LIC-123456"
                />
              </div>
              <div className="md:col-start-1">
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={newDoctorData.password}
                  onChange={e => setNewDoctorData({ ...newDoctorData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={newDoctorData.confirmPassword}
                  onChange={e => setNewDoctorData({ ...newDoctorData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreateDoctor(false)}
                className="px-6 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-primary-500 text-white hover:bg-primary-600 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/20"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedDoctor ? (
        <div className="space-y-6 animate-fade-in">
          <button
            onClick={() => setSelectedDoctor(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Doctor List
          </button>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center gap-4">
                <img src={selectedDoctor.avatar} alt={selectedDoctor.name} className="w-40 h-40 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-xl" />
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-900">{selectedDoctor.name}</h3>
                  <p className="text-primary-600 font-bold mt-1 uppercase tracking-wider text-xs">{selectedDoctor.department || selectedDoctor.specialty}</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Email Address</p>
                  <p className="text-slate-700 font-semibold">{selectedDoctor.email}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Phone Number</p>
                  <p className="text-slate-700 font-semibold">{selectedDoctor.phone || 'N/A'}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Qualification</p>
                  <p className="text-slate-700 font-semibold">{selectedDoctor.qualification || 'Doctor of Medicine'}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Registration Number</p>
                  <p className="text-slate-700 font-semibold">{selectedDoctor.medicalRegistrationNumber || selectedDoctor.license || 'N/A'}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50 md:col-span-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Qualification Certificate</p>
                  <div className="mt-2 flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary-500" />
                      <span className="text-sm text-slate-600 font-medium">doctor_credential_verification.pdf</span>
                    </div>
                    <button
                      onClick={() => handleViewCertificate(selectedDoctor.qualificationCertificate)}
                      className="text-primary-600 text-xs font-bold hover:underline bg-transparent border-0 p-0 cursor-pointer"
                    >
                      View PDF
                    </button>
                  </div>
                </div>
                <div className="p-5 bg-slate-900 rounded-2xl md:col-span-2 text-white">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Registration Details</p>
                  <p className="text-sm text-slate-300">Registered On: <span className="text-white font-bold">{selectedDoctor.registeredAt ? new Date(selectedDoctor.registeredAt).toLocaleString() : 'Pre-system Initial Data'}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedDoctors.map(doc => (
            <div key={doc.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-start gap-5 hover:shadow-xl hover:border-primary-100 transition-all duration-300 group">
              <img src={doc.avatar} alt={doc.name} className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-white shadow-md group-hover:scale-105 transition-transform" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 text-lg truncate group-hover:text-primary-600 transition-colors">{doc.name}</h4>
                <p className="text-primary-600 font-bold text-[10px] uppercase tracking-wider mb-2">{doc.specialty}</p>
                <p className="text-slate-500 text-xs mb-4 truncate">{doc.email}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{(doc.patients?.length || 0)} patients</p>
                  <button
                    onClick={() => setSelectedDoctor(doc)}
                    className="text-primary-600 text-[10px] font-black uppercase tracking-widest hover:text-primary-700 transition-colors flex items-center gap-1"
                  >
                    View Details
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {approvedDoctors.length === 0 && !selectedDoctor && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 italic text-slate-400">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-200" />
          </div>
          <p className="text-lg">No doctors found matching "{doctorSearchQuery}"</p>
        </div>
      )}
    </div>
  );
};

const ReportsContent = ({ user, localDoctors, localPatients, alerts, setNotification, vitalRecords, formatDateTime, systemSettings }) => {
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportData, setReportData] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [showPatientSelector, setShowPatientSelector] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDoctorId, setFilterDoctorId] = useState('')

  const reportTypes = [
    {
      id: 'individual-followup',
      title: 'Individual Patient Follow-Up Report',
      description: 'Detailed recovery status, health data, and alert history for one specific patient.',
      icon: UserCheck,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      requiresSelection: true
    },
    {
      id: 'overall-followup',
      title: 'Overall Follow-Up Report',
      description: 'Aggregate monitoring of all patients, recovery statistics, and abnormal condition alerts.',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      id: 'alerts-history',
      title: 'Alert History Report',
      description: 'Detailed log of all system-generated alerts and acknowledgement status.',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      id: 'doctor-activity',
      title: 'Doctor Activity Report',
      description: 'Staff performance monitoring and patient load distribution.',
      icon: Stethoscope,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ]

  const handleReportClick = (report) => {
    if (report.requiresSelection) {
      setShowPatientSelector(true)
      setSelectedReport(report.id)
    } else {
      generateReport(report.id)
    }
  }

  const generateReport = (typeId, patientId = null) => {
    setIsGenerating(true)
    setSelectedReport(typeId)
    setShowPatientSelector(false)

    // Artificial delay for premium feel
    setTimeout(() => {
      let data = []
      switch (typeId) {
        case 'individual-followup':
          const patient = localPatients.find(p => p.id === parseInt(patientId))
          if (patient) {
            const doctor = localDoctors.find(d => d.id === patient.doctorId)
            const patientAlerts = alerts.filter(a => a.patientId === patient.id)
            const patientVitals = vitalRecords.filter(v => v.patientId === patient.id)

            data = [{
              Attribute: 'Patient Name',
              Value: patient.name || 'N/A'
            }, {
              Attribute: 'Condition',
              Value: patient.condition || 'General'
            }, {
              Attribute: 'Primary Doctor',
              Value: doctor?.name || 'Unassigned'
            }, {
              Attribute: 'Overall Adherence',
              Value: `${patient.adherence || 0}%`
            }, {
              Attribute: 'Total Alerts',
              Value: patientAlerts.length
            }, {
              Attribute: 'Latest Health Check',
              Value: patientVitals.length > 0 ? patientVitals[patientVitals.length - 1].date : 'No data'
            }, {
              Attribute: 'Recovery Status',
              Value: patient.status || 'stable'
            }]
          }
          break
        case 'overall-followup':
          const total = localPatients.length
          const missed = localPatients.filter(p => !p.lastCheckIn).length
          const abnormal = localPatients.filter(p => p.status === 'critical' || p.status === 'at-risk').length
          const activeAlerts = alerts.filter(a => !a.acknowledged).length

          data = [{
            Metric: 'Total Patients Under Follow-Up',
            Value: total
          }, {
            Metric: 'Active Alerts Generated',
            Value: activeAlerts
          }, {
            Metric: 'Patients with Abnormal Conditions',
            Value: abnormal
          }, {
            Metric: 'Patients who Missed Follow-ups',
            Value: missed
          }, {
            Metric: 'Average System Adherence',
            Value: `${Math.round(localPatients.reduce((acc, p) => acc + (p.adherence || 0), 0) / total)}%`
          }]
          break
        case 'alerts-history':
          data = alerts.map(a => {
            const patient = localPatients.find(p => p.id === a.patientId)
            return {
              id: a.id,
              patient: patient?.name || 'Unknown',
              type: a.type,
              message: a.message,
              status: a.acknowledged ? 'Acknowledged' : 'Pending',
              time: formatDateTime(a.timestamp)
            }
          })
          break
        case 'doctor-activity':
          data = localDoctors.map(d => ({
            id: d.id,
            name: d.name,
            specialty: d.specialty,
            patients: (d.patients || []).length,
            status: d.isApproved ? 'Active' : 'Pending Approval'
          }))
          break
        default:
          data = []
      }
      setReportData(data)
      setIsGenerating(false)
    }, 800)
  }

  const downloadReport = () => {
    try {
      const reportInfo = reportTypes.find(r => r.id === selectedReport)
      if (!reportInfo || reportData.length === 0) return

      const doc = new jsPDF()
      const timestamp = new Date().toLocaleString()

      // Add Title
      doc.setFontSize(20)
      doc.setTextColor(20, 184, 166) // Teal 500
      doc.text(`${systemSettings.name || 'CareTrack'} Report`, 14, 22)

      doc.setFontSize(14)
      doc.setTextColor(100)
      doc.text(reportInfo.title, 14, 32)

      doc.setFontSize(10)
      doc.setTextColor(150)
      doc.text(`Generated on: ${timestamp}`, 14, 40)
      doc.text(`Generated by: ${user.name} (Administrator)`, 14, 46)

      // Extract headers and data for autoTable
      const headers = Object.keys(reportData[0]).filter(k => k !== 'id')
      const body = reportData.map(row =>
        headers.map(header => {
          const value = row[header]
          return typeof value === 'object' ? (value?.name || JSON.stringify(value)) : value
        })
      )

      autoTable(doc, {
        startY: 55,
        head: [headers.map(h => h.replace(/([A-Z])/g, ' $1').toUpperCase())],
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [20, 184, 166] }, // Teal 500
        styles: { fontSize: 9 },
        margin: { top: 55 }
      })

      // Footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10)
        doc.text(`${systemSettings.name || 'CareTrack'} Integrated Reporting Engine • Confidential Medical Record`, 14, doc.internal.pageSize.height - 10)
      }

      doc.save(`${(systemSettings.name || 'CareTrack').replace(/\s+/g, '_')}_${reportInfo.title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`)

      setNotification({ type: 'success', message: `${reportInfo.title} exported successfully` })
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('PDF Export Error:', error)
      setNotification({ type: 'error', message: 'Failed to generate PDF. Please try again.' })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const filteredPatients = localPatients.filter(p => {
    const name = p.name || ''
    const condition = p.condition || ''
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      condition.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDoctor = !filterDoctorId || p.doctorId === parseInt(filterDoctorId)
    return matchesSearch && matchesDoctor
  })

  return (
    <div className="space-y-8 animate-fade-up">
      {showPatientSelector && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-50 rounded-2xl">
                  <UserCheck className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Select Patient</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Individual Report Generation</p>
                </div>
              </div>
              <button
                onClick={() => { setShowPatientSelector(false); setSelectedReport(null); setSearchQuery(''); setFilterDoctorId(''); }}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 hover:text-red-500 transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="p-6 bg-slate-50/50 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or condition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 focus:border-teal-500 rounded-2xl transition-all font-semibold text-slate-700 shadow-sm"
                />
              </div>
              <div className="relative min-w-[200px]">
                <select
                  value={filterDoctorId}
                  onChange={(e) => setFilterDoctorId(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 bg-white border-2 border-slate-100 focus:border-teal-500 rounded-2xl appearance-none transition-all font-semibold text-slate-700 shadow-sm"
                >
                  <option value="">All Doctors</option>
                  {localDoctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Patient List */}
            <div
              className="max-h-[400px] overflow-y-auto p-4 space-y-2 bg-white"
              data-lenis-prevent
            >
              {filteredPatients.length > 0 ? (
                filteredPatients.map(p => {
                  const doctor = localDoctors.find(d => d.id === p.doctorId)
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPatientId(p.id)
                        generateReport('individual-followup', p.id)
                      }}
                      className="w-full group flex items-center justify-between p-4 rounded-2xl hover:bg-teal-50/50 border border-transparent hover:border-teal-100 transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${p.status === 'critical' ? 'bg-red-50 text-red-600' :
                            p.status === 'at-risk' ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-teal-600'
                          }`}>
                          {(p.name || '?').charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{p.name || 'Anonymous Patient'}</h4>
                          <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="text-slate-500">{p.condition || 'No condition specified'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                            <span>Dr. {doctor?.name || 'Unassigned'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Adherence</p>
                          <p className={`font-black ${p.adherence > 80 ? 'text-teal-600' : 'text-amber-600'}`}>{p.adherence}%</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-medium italic">No patients match your search criteria.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Total Results: {filteredPatients.length} Patients</span>
              <span className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-teal-500" />
                Secure Access Logged
              </span>
            </div>
          </div>
        </div>
      )}

      {!selectedReport || showPatientSelector ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                onClick={() => handleReportClick(report)}
                className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-teal-100 transition-all text-left flex flex-col items-start gap-4"
              >
                <div className={`w-14 h-14 ${report.bg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner`}>
                  <report.icon className={`w-7 h-7 ${report.color}`} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">{report.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{report.description}</p>
                </div>
                <div className="mt-auto pt-4 flex items-center gap-2 text-teal-600 font-bold text-xs">
                  <span>Generate Report</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px]"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <h3 className="text-3xl font-black tracking-tight">System Analytics & Monitoring</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Access real-time clinical data, staff performance metrics, and patient adherence
                  logs to drive evidence-based decision making for your facility.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-black text-teal-400">{localPatients.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Monitored</p>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="text-center">
                  <p className="text-3xl font-black text-amber-400">{alerts.filter(a => !a.acknowledged).length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Alerts</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setSelectedReport(null); setSelectedPatientId(''); }}
                className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
              >
                <ArrowLeft className="w-5 h-5 text-slate-500" />
              </button>
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {reportTypes.find(r => r.id === selectedReport)?.title}
                </h3>
                <p className="text-slate-500 text-sm font-medium">Generated on {formatDateTime(new Date().toISOString())}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => generateReport(selectedReport, selectedPatientId)}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={downloadReport}
                className="px-6 py-2.5 bg-teal-500 text-white rounded-2xl text-xs font-bold hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>

          <div className="flex-1 p-8">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Processing Cloud Data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {reportData.length > 0 && Object.keys(reportData[0]).filter(k => k !== 'id').map(key => (
                        <th key={key} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {reportData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-teal-50/30 transition-colors group">
                        {Object.entries(row).filter(([key]) => key !== 'id').map(([key, value], vIdx) => (
                          <td key={vIdx} className="px-6 py-4">
                            {key === 'status' || key === 'Recovery Status' || key === 'Value' && (value === 'critical' || value === 'at-risk' || value === 'stable') ? (
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${value === 'critical' || value === 'Pending' || value === 'at-risk' ? 'bg-red-100 text-red-600' :
                                  value === 'stable' || value === 'Acknowledged' || value === 'Active' ? 'bg-teal-100 text-teal-600' :
                                    'bg-amber-100 text-amber-600'
                                }`}>
                                {value}
                              </span>
                            ) : key === 'adherence' || (key === 'Value' && value?.toString().includes('%')) || key === 'patients' || key === 'records' ? (
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-700">{value}</span>
                                {value?.toString().includes('%') && (
                                  <div className="flex-1 max-w-[60px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${(parseInt(value) || 0) > 80 ? 'bg-teal-500' : (parseInt(value) || 0) > 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                      style={{ width: `${parseInt(value) || 0}%` }}
                                    ></div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="font-medium text-slate-600 text-sm">{value}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportData.length === 0 && (
                  <div className="text-center py-20 text-slate-400 italic">No data records found for this report period.</div>
                )}
              </div>
            )}
          </div>

          <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">{systemSettings.name || 'CareTrack'} Integrated Reporting Engine v2.4.0</p>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-500" />
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">Clinically Verified Source</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const PatientsContent = ({
  localPatients,
  localDoctors,
  patientSearchQuery,
  setPatientSearchQuery,
  selectedPatient,
  setSelectedPatient,
  handleAssignDoctorToPatient,
  selectedNurseId,
  setSelectedNurseId,
  assignNurseToPatient,
  setLocalPatients,
  setLocalNurses,
  showSuccess,
  formatDateTime,
  formatDate,
  users,
  handleDeactivatePatient,
  handleReactivatePatient,
  handleDeletePatient
}) => {
  const [currentTab, setCurrentTab] = useState('active'); // 'active', 'discharged', 'unassigned', 'deactivated'

  const filteredList = localPatients.filter(p => {
    if (!p.isApproved) return false;

    // Search filter
    const matchesSearch = (p.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
      (p.condition || '').toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(patientSearchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Tab filter
    if (currentTab === 'active') return p.status !== 'discharged' && p.status !== 'deactivated' && p.doctorId;
    if (currentTab === 'discharged') return p.status === 'discharged';
    if (currentTab === 'unassigned') return !p.doctorId && p.status !== 'deactivated' && p.status !== 'discharged';
    if (currentTab === 'deactivated') return p.status === 'deactivated';

    return true;
  });

  const approvedDoctors = localDoctors.filter(d => d.isApproved);

  if (selectedPatient) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedPatient(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patients
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
            <img src={selectedPatient.avatar} alt={selectedPatient.name} className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-sm" />
            <div>
              <h3 className="text-3xl font-bold text-slate-800 mb-2">{selectedPatient.name}</h3>
              <div className="flex items-center gap-4 text-slate-500">
                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {selectedPatient.gender}, {selectedPatient.age}y
                </span>
                <span className="text-sm font-medium">{selectedPatient.email}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Reason for Consultation</h4>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed font-medium">
                  {selectedPatient.consultationReason || "No consultation reason provided."}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Registration Details</h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Registered On</span>
                    <span className="text-slate-800 font-semibold">
                      {selectedPatient.registeredAt ? formatDateTime(selectedPatient.registeredAt) : formatDate(selectedPatient.enrollDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary-50/30 p-8 rounded-3xl border border-primary-100 flex flex-col justify-center">
              <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                <button
                  onClick={() => handleReactivatePatient(selectedPatient.id)}
                  className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${selectedPatient.status !== 'discharged' && selectedPatient.status !== 'deactivated'
                      ? 'bg-white text-slate-400 cursor-not-allowed opacity-50'
                      : 'bg-white text-teal-600 shadow-sm hover:bg-teal-50'
                    }`}
                  disabled={selectedPatient.status !== 'discharged' && selectedPatient.status !== 'deactivated'}
                >
                  <CheckCircle className="w-4 h-4" />
                  Reactivate
                </button>
                <button
                  onClick={() => handleDeactivatePatient(selectedPatient.id)}
                  className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${selectedPatient.status === 'deactivated'
                      ? 'bg-white text-slate-400 cursor-not-allowed opacity-50'
                      : 'bg-white text-amber-600 shadow-sm hover:bg-amber-50'
                    }`}
                  disabled={selectedPatient.status === 'deactivated'}
                >
                  <Lock className="w-4 h-4" />
                  Deactivate
                </button>
                <button
                  onClick={() => handleDeletePatient(selectedPatient.id)}
                  className="flex-1 py-3 bg-white text-red-600 rounded-lg text-xs font-bold shadow-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Delete Permanently
                </button>
              </div>

              <h4 className="text-xl font-bold text-slate-800 mb-2">Assign Primary Doctor</h4>
              <p className="text-slate-500 text-sm mb-6">Select a clinician to oversee this patient's remote monitoring and clinical progress.</p>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Clinician</label>
                  <select
                    value={selectedPatient.doctorId || ''}
                    onChange={(e) => {
                      const docId = parseInt(e.target.value);
                      handleAssignDoctorToPatient(selectedPatient.id, docId);
                      // Update the local selected patient object so the dropdown reflects the change
                      setSelectedPatient({ ...selectedPatient, doctorId: docId });
                      // Refresh local state to update the list background
                      setLocalPatients([...users.patients]);
                      setSelectedNurseId('');
                    }}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-semibold shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="">Choose a Doctor...</option>
                    {approvedDoctors.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialty}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-[38px] pointer-events-none text-slate-400">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>

                {/* Dependent Nurse Assignment dropdown for active patients */}
                <div className={`relative ${!selectedPatient.doctorId ? 'opacity-50 pointer-events-none' : ''}`}>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Nurse</label>
                  <select
                    value={selectedPatient.nurseId || selectedNurseId || ''}
                    onChange={(e) => {
                      const nurseId = parseInt(e.target.value);
                      if (nurseId) {
                        assignNurseToPatient(selectedPatient.id, nurseId);
                        setSelectedNurseId(nurseId.toString()); // Local UI state
                        setLocalPatients([...users.patients]);
                        setLocalNurses([...users.nurses]);
                      }
                    }}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-semibold shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="">{selectedPatient.doctorId ? 'Choose a Nurse...' : 'Select a doctor first'}</option>
                    {users.nurses.filter(n => n.isApproved && n.assignedDoctorId === selectedPatient.doctorId).map(n => (
                      <option key={n.id} value={n.id}>{n.name} ({n.department})</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-[38px] pointer-events-none text-slate-400">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>

                <button
                  disabled={!selectedPatient.doctorId}
                  onClick={() => {
                    showSuccess(`Patient assigned successfully`)
                    setSelectedPatient(null)
                  }}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-slate-800 shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-800">Patient Management</h3>
      </div>

      {/* Status Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'active', label: 'Active', count: localPatients.filter(p => p.isApproved && p.status !== 'discharged' && p.status !== 'deactivated' && p.doctorId).length },
          { id: 'discharged', label: 'Discharged', count: localPatients.filter(p => p.isApproved && p.status === 'discharged').length },
          { id: 'unassigned', label: 'Unassigned', count: localPatients.filter(p => p.isApproved && !p.doctorId && p.status !== 'deactivated' && p.status !== 'discharged').length },
          { id: 'deactivated', label: 'Deactivated', count: localPatients.filter(p => p.isApproved && p.status === 'deactivated').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${currentTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${currentTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search patients by name, condition, or email..."
          value={patientSearchQuery}
          onChange={(e) => setPatientSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium shadow-sm"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Registered At</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredList.map(patient => (
              <tr key={patient.id} className="hover:bg-slate-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={patient.avatar} alt={patient.name} className="w-10 h-10 rounded-full bg-slate-100" />
                    <div>
                      <span className="font-semibold text-slate-800 block text-sm">{patient.name}</span>
                      <span className="text-slate-400 text-xs">{patient.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600 font-medium">
                    {patient.registeredAt ? formatDateTime(patient.registeredAt) : formatDate(patient.enrollDate)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${patient.status === 'discharged' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                      patient.status === 'deactivated' ? 'bg-red-50 text-red-600 border-red-100' :
                        !patient.doctorId ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-teal-50 text-teal-600 border-teal-100'
                    }`}>
                    {patient.status === 'discharged' ? 'Discharged' :
                      patient.status === 'deactivated' ? 'Deactivated' :
                        !patient.doctorId ? 'Unassigned' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right pr-8">
                  <button
                    onClick={() => setSelectedPatient(patient)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all active:scale-95"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredList.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 italic text-slate-400">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-lg">No patients found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard
