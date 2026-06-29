import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { users, vitalRecords, formatDate, getStatusColor, getUnreadCount, notifications, markNotificationsAsRead, addVitalRecord, canSubmitCheckIn, loadUsers, prescriptionAPI } from '../data/mockData'
import { QRCodeCanvas } from 'qrcode.react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import ChatWindow from '../components/ChatWindow'
import {
  LayoutDashboard, Heart, Bell, MessageSquare, LogOut,
  Activity, TrendingUp, Calendar, CheckCircle, AlertTriangle,
  ChevronRight, Plus, Upload, Shield, ArrowLeft, FileText, Download
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './PatientDashboard.css'

function PatientDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(getUnreadCount(user.id))
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [checkInData, setCheckInData] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
    bloodSugar: '',
    painLevel: 5,
    notes: ''
  })
  const [localNotifications, setLocalNotifications] = useState(notifications.filter(n => String(n.patientId) === String(user.id)))
  const [systemName, setSystemName] = useState(localStorage.getItem('caretrack_system_name') || 'CareTrack')
  const [localPatient, setLocalPatient] = useState(users.patients.find(p => String(p.id) === String(user.id)))
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedCareMember, setSelectedCareMember] = useState(null)
  const unreadNotifCount = localNotifications.filter(n => !n.read).length

  useEffect(() => {
    const handleSync = (e) => {
      // Handle both standard storage and custom sync events
      if (e.key === 'caretrack_users' || !e.key || e.type === 'caretrack_sync') {
        setTimeout(() => {
          setUnreadCount(getUnreadCount(user.id))
          setLocalNotifications(notifications.filter(n => String(n.patientId) === String(user.id)))
          setSystemName(localStorage.getItem('caretrack_system_name') || 'CareTrack')
          
          const freshUsers = e.detail?.data || loadUsers();
          const freshPatient = freshUsers.patients.find(p => String(p.id) === String(user.id));
          if (freshPatient) {
            setLocalPatient({ ...freshPatient });
          }
        }, 50);
      }
    };
    
    window.addEventListener('storage', handleSync);
    window.addEventListener('caretrack_sync', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('caretrack_sync', handleSync);
    };
  }, [user.id]);

  // Get patient data
  const patient = localPatient;
  const patientVitals = vitalRecords.filter(v => v.patientId === patient?.id)
  const latestVitals = patientVitals[patientVitals.length - 1]
  
  // Look up assigned team members for scoping
  const assignedDoctor = users.doctors.find(d => d.id === patient?.doctorId)
  const assignedNurse = users.nurses.find(n => n.id === patient?.nurseId)

  // Fetch patient prescriptions
  const myPrescriptions = prescriptionAPI.getPatientPrescriptions(patient?.id || user.id);

  const downloadPrescription = (rx) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(15, 118, 110);
    doc.text("CareTrack Digital Prescription", 105, 20, null, null, "center");
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Hospital Name: CareTrack System", 20, 40);
    doc.text(`Doctor Name: Dr. ${assignedDoctor?.name || 'Unknown'}`, 20, 50);
    doc.text(`Doctor ID: ${rx.doctorId}`, 20, 60);
    doc.text(`Date: ${new Date(rx.createdAt).toLocaleDateString()}`, 140, 40);

    // Patient Details
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text("Patient Details", 20, 75);
    doc.setFontSize(11);
    doc.setTextColor(80);
    doc.text(`Name: ${patient?.name}`, 20, 85);
    doc.text(`Age: ${patient?.age}`, 20, 95);
    doc.text(`Gender: ${patient?.gender}`, 100, 95);
    doc.text(`Patient ID: ${rx.patientId}`, 100, 85);

    // Medicine Details
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text("Prescription Details", 20, 115);

    autoTable(doc, {
      startY: 125,
      head: [['Medicine', 'Dosage', 'Duration', 'Instructions']],
      body: [
        [rx.medicineName, rx.dosage, rx.duration, rx.instructions]
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 118, 110] }
    });

    const finalY = doc.lastAutoTable.finalY || 150;

    // Verification & QR
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text("Verification", 20, finalY + 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Prescription ID: ${rx.id}`, 20, finalY + 30);
    doc.text(`Digital Signature:`, 20, finalY + 40);
    doc.setFontSize(8);
    
    const splitSignature = doc.splitTextToSize(rx.signature, 110);
    doc.text(splitSignature, 20, finalY + 45);

    // Add QR Code
    const qrElement = document.getElementById(`qr-${rx.id}`);
    if (qrElement) {
      const qrDataUrl = qrElement.toDataURL('image/png');
      doc.addImage(qrDataUrl, 'PNG', 140, finalY + 15, 40, 40);
    }

    doc.save(`Prescription_${rx.id}.pdf`);
  };

  const handleCheckInSubmit = (e) => {
    e.preventDefault()
    
    // Prepare data for save
    const record = {
      systolic: parseInt(checkInData.systolic),
      diastolic: parseInt(checkInData.diastolic),
      pulse: parseInt(checkInData.pulse),
      bloodSugar: parseInt(checkInData.bloodSugar),
      painLevel: checkInData.painLevel,
      notes: checkInData.notes
    }

    addVitalRecord(patient.id, record)
    alert('Check-in submitted successfully! Your care team will review your data.')
    
    setShowCheckIn(false)
    setCheckInData({
      systolic: '',
      diastolic: '',
      pulse: '',
      bloodSugar: '',
      painLevel: 5,
      notes: ''
    })
  }



  const Sidebar = () => (
    <div className="w-64 bg-gradient-to-b from-teal-600 to-teal-800 text-white h-screen flex flex-col fixed left-0 top-0 animate-sidebar">
      <div className="p-6 border-b border-teal-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">{systemName}</h1>
            <p className="text-xs text-teal-200">Patient Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'checkin', label: 'Daily Check-In', icon: CheckCircle, disabled: !patient?.followUpPlan },
          { id: 'history', label: 'My History', icon: Activity },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
        ].map((item) => (
          <button
            key={item.id}
            disabled={item.disabled}
            onClick={() => { 
              setActiveTab(item.id); 
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-300 icon-rotate relative ${activeTab === item.id
              ? 'nav-item-active text-white'
              : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
          >
            <item.icon className="w-5 h-5 transition-transform" />
            <div className="flex flex-col items-start">
              <span className="font-medium text-sm">{item.label}</span>
              {item.id === 'checkin' && !patient?.followUpPlan && (
                <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" /> Locked
                </span>
              )}
            </div>
            {item.id === 'messages' && unreadCount > 0 && (
              <span className="absolute right-4 w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.8)]"></span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-teal-500/30">
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-colors group"
        >
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-white/20 ring-2 ring-transparent group-hover:ring-white/40 transition-all" />
          <div>
            <p className="font-medium text-sm group-hover:text-white transition-colors">{user.name}</p>
            <p className="text-xs text-teal-200">Patient</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-teal-100 hover:text-white backdrop-blur"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  const DashboardContent = () => (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white animate-fade-up">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {patient?.name}!</h2>
        <p className="text-teal-100">Here's your health summary for today</p>
        <div className="flex items-center gap-4 mt-4">
          <div className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur hover:bg-white/30 transition-colors">
            <p className="text-sm text-teal-100">Status</p>
            <p className="font-semibold capitalize">{patient?.status}</p>
          </div>
          <div className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur hover:bg-white/30 transition-colors">
            <p className="text-sm text-teal-100">Adherence</p>
            <p className="font-semibold">{patient?.adherence}%</p>
          </div>
        </div>
      </div>

      {/* Care Team Section */}
      {(assignedDoctor || assignedNurse) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up delay-100">
          {assignedDoctor && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-primary-300 transition-all group">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={assignedDoctor.avatar} alt={assignedDoctor.name} className="w-16 h-16 rounded-full bg-slate-100 group-hover:ring-4 group-hover:ring-primary-100 transition-all" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Your Primary Doctor</p>
                  <h3 className="text-lg font-bold text-slate-800">{assignedDoctor.name}</h3>
                  <p className="text-sm text-slate-500">{assignedDoctor.specialty}</p>
                </div>
              </div>
            </div>
          )}
          {assignedNurse && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-teal-300 transition-all group">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={assignedNurse.avatar} alt={assignedNurse.name} className="w-16 h-16 rounded-full bg-slate-100 group-hover:ring-4 group-hover:ring-teal-100 transition-all" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Activity className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">Assigned Nurse</p>
                  <h3 className="text-lg font-bold text-slate-800">{assignedNurse.name}</h3>
                  <p className="text-sm text-slate-500">{assignedNurse.department}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Follow-Up Plan & Daily Check-In Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up delay-200">
        {/* Plan Details Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-primary-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" />
                Follow-Up Plan
              </h3>
              {patient?.followUpPlan ? (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase tracking-widest">Active</span>
              ) : (
                <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-widest">Pending</span>
              )}
            </div>
            
            {patient?.followUpPlan ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Current Protocol</p>
                  <p className="font-bold text-slate-800 text-lg">{patient.followUpPlan.name}</p>
                </div>
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {patient.followUpPlan.description}
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Started</p>
                    <p className="text-xs font-bold text-slate-700">{formatDate(patient.followUpPlan.startDate)}</p>
                  </div>
                  {patient.followUpPlan.endDate && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Target End</p>
                      <p className="text-xs font-bold text-slate-700">{formatDate(patient.followUpPlan.endDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm font-medium px-4">
                  No follow-up plan assigned by doctor yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Daily Check-In Integration Card */}
        <div className={`rounded-2xl p-6 shadow-sm border transition-all flex flex-col justify-between ${
          patient?.followUpPlan 
            ? 'bg-white border-slate-200 hover:border-green-300' 
            : 'bg-slate-50 border-slate-100 opacity-75'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Daily Check-In
              </h3>
              {!patient?.followUpPlan && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded-full">
                  <Shield className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Locked</span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              {patient?.followUpPlan 
                ? "Submit your daily vitals to help your care team monitor your recovery progress in real-time."
                : "Your daily check-in feature will be unlocked once your doctor assigns a follow-up plan."}
            </p>
          </div>

          <button
            disabled={!patient?.followUpPlan}
            onClick={() => setActiveTab('checkin')}
            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              patient?.followUpPlan 
                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 active:scale-95' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {patient?.followUpPlan ? (
              <>
                <Plus className="w-5 h-5" />
                Start Check-In
              </>
            ) : (
              'Feature Locked'
            )}
          </button>
        </div>
      </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 flex items-center gap-4 animate-fade-up delay-200 hover-lift icon-rotate">
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Next Appointment</h3>
            <p className="text-slate-500 text-sm">Feb 20, 2026 - 10:00 AM</p>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('messages')}
          className="bg-white rounded-2xl p-6 border border-slate-200 flex items-center gap-4 animate-fade-up delay-300 hover-lift icon-rotate cursor-pointer group relative overflow-hidden"
        >
          <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <MessageSquare className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Messages</h3>
            <p className="text-slate-500 text-sm">
              {unreadCount > 0 ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}` : 'No unread messages'}
            </p>
          </div>
          {unreadCount > 0 && (
            <span className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </div>

      {/* Latest Vitals */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-fade-up delay-400">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Latest Vitals</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 text-center hover-lift cursor-default group">
            <p className="text-slate-500 text-sm group-hover:text-primary-500 transition-colors">Systolic BP</p>
            <p className="text-3xl font-bold text-slate-800">{latestVitals?.systolic || '--'}</p>
            <p className="text-xs text-slate-400">mmHg</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center hover-lift cursor-default group">
            <p className="text-slate-500 text-sm group-hover:text-primary-500 transition-colors">Diastolic BP</p>
            <p className="text-3xl font-bold text-slate-800">{latestVitals?.diastolic || '--'}</p>
            <p className="text-xs text-slate-400">mmHg</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center hover-lift cursor-default group">
            <p className="text-slate-500 text-sm group-hover:text-primary-500 transition-colors">Pulse</p>
            <p className="text-3xl font-bold text-slate-800">{latestVitals?.pulse || '--'}</p>
            <p className="text-xs text-slate-400">bpm</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center hover-lift cursor-default group">
            <p className="text-slate-500 text-sm group-hover:text-primary-500 transition-colors">Blood Sugar</p>
            <p className="text-3xl font-bold text-slate-800">{latestVitals?.bloodSugar || '--'}</p>
            <p className="text-xs text-slate-400">mg/dL</p>
          </div>
        </div>
      </div>

      {/* Vitals Trend */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-fade-up delay-500">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Health Trend (Last 7 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={patientVitals.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                animationDuration={300}
              />
              <Line isAnimationActive={true} animationDuration={1000} type="monotone" dataKey="systolic" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9' }} name="Systolic BP" />
              <Line isAnimationActive={true} animationDuration={1000} animationBegin={200} type="monotone" dataKey="diastolic" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} name="Diastolic BP" />
              <Line isAnimationActive={true} animationDuration={1000} animationBegin={400} type="monotone" dataKey="pulse" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} name="Pulse" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Digital Prescriptions */}
      {myPrescriptions.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-fade-up delay-600">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-500" />
            Digital Prescriptions
          </h3>
          <div className="space-y-6">
            {myPrescriptions.map(rx => (
              <div key={rx.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <h4 className="text-xl font-bold text-teal-700 flex items-center gap-2">
                      <Shield className="w-5 h-5" /> CareTrack Digital Prescription
                    </h4>
                    <p className="text-sm text-slate-500 mt-2">Hospital Name: CareTrack System</p>
                    <p className="text-sm text-slate-500">Doctor Name: {assignedDoctor?.name}</p>
                    <p className="text-sm text-slate-500">Date: {new Date(rx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => downloadPrescription(rx)}
                    className="flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors shrink-0"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
                
                {/* Patient Details */}
                <div className="p-6 border-b border-slate-100">
                  <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">👤 Patient Details</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-slate-500 block text-xs">Name</span> <span className="font-medium text-slate-800">{patient?.name}</span></div>
                    <div><span className="text-slate-500 block text-xs">Age</span> <span className="font-medium text-slate-800">{patient?.age}</span></div>
                    <div><span className="text-slate-500 block text-xs">Gender</span> <span className="font-medium text-slate-800">{patient?.gender}</span></div>
                    <div><span className="text-slate-500 block text-xs">Patient ID</span> <span className="font-medium text-slate-800">{patient?.id}</span></div>
                  </div>
                </div>

                {/* Medicine Details */}
                <div className="p-6 border-b border-slate-100">
                  <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">💊 Prescription Details</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="p-3 font-semibold rounded-l-lg">Medicine</th>
                          <th className="p-3 font-semibold">Dosage</th>
                          <th className="p-3 font-semibold">Duration</th>
                          <th className="p-3 font-semibold rounded-r-lg">Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-50">
                          <td className="p-3 font-bold text-slate-800">{rx.medicineName}</td>
                          <td className="p-3 text-slate-600">{rx.dosage}</td>
                          <td className="p-3 text-slate-600">{rx.duration}</td>
                          <td className="p-3 text-slate-600">{rx.instructions}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Verification & QR Code */}
                <div className="p-6 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1 overflow-hidden">
                    <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">🔐 Verification</h5>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Prescription ID</p>
                        <p className="text-sm font-mono text-slate-800 bg-white px-3 py-1 rounded border border-slate-200 inline-block mt-1">{rx.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-2">Digital Signature</p>
                        <p className="text-xs font-mono text-slate-500 bg-white px-3 py-2 rounded border border-slate-200 mt-1 break-all">{rx.signature}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center shrink-0">
                    <QRCodeCanvas 
                      id={`qr-${rx.id}`}
                      value={`${window.location.origin}/verify-prescription/${rx.id}`}
                      size={120}
                      level="H"
                      includeMargin={true}
                    />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-2">Scan to Verify</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )


  const HistoryContent = () => (
    <div className="space-y-6 animate-fade-up">
      <h3 className="text-xl font-semibold text-slate-800">My Health History</h3>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Vital Signs History</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Sys BP</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Dia BP</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Pulse</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Blood Sugar</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Pain</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {[...patientVitals].reverse().map((vital, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">{formatDate(vital.date)}</td>
                  <td className="px-4 py-3 text-slate-800 font-medium">{vital.systolic}</td>
                  <td className="px-4 py-3 text-slate-800 font-medium">{vital.diastolic}</td>
                  <td className="px-4 py-3 text-slate-800 font-medium">{vital.pulse}</td>
                  <td className="px-4 py-3 text-slate-800 font-medium">{vital.bloodSugar}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${vital.painLevel <= 3 ? 'bg-green-100 text-green-700' :
                      vital.painLevel <= 6 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {vital.painLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-sm">{vital.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const CheckInContent = () => {
    const isLocked = !patient?.followUpPlan
    const lastCheckIn = patientVitals.length > 0 ? patientVitals[patientVitals.length - 1] : null
    
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Daily Health Check-In</h3>
            <p className="text-slate-500 font-medium">Record your daily vitals for clinical monitoring</p>
          </div>
          <button
            onClick={() => setShowCheckIn(true)}
            disabled={isLocked || !canSubmitCheckIn(patient.id)}
            className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-xl ${
              isLocked 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : !canSubmitCheckIn(patient.id)
                  ? 'bg-green-100 text-green-600 cursor-default shadow-none border border-green-200'
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
            }`}
          >
            {!canSubmitCheckIn(patient.id) && !isLocked ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Completed Today
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Start Today's Entry
              </>
            )}
          </button>
        </div>

        {isLocked ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200 max-w-2xl mx-auto my-12">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-slate-300" />
            </div>
            <h4 className="text-2xl font-bold text-slate-800 mb-3">Feature Locked</h4>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Your Daily Check-In portal will become available once your doctor assigns your personalized Follow-Up Plan. 
              Please contact your care team if you have any questions.
            </p>
            <button 
              onClick={() => setActiveTab('messages')}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              Message Care Team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8">
                  <Activity className="w-12 h-12 text-teal-500/10" />
                </div>
                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-500" />
                  Your Recent Status
                </h4>
                
                {lastCheckIn ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Pressure</p>
                      <p className="text-2xl font-black text-slate-800">{lastCheckIn.systolic}/{lastCheckIn.diastolic} <span className="text-xs text-slate-400 font-medium">mmHg</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Heart Rate</p>
                      <p className="text-2xl font-black text-slate-800">{lastCheckIn.pulse} <span className="text-xs text-slate-400 font-medium">bpm</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Sugar</p>
                      <p className="text-2xl font-black text-slate-800">{lastCheckIn.bloodSugar} <span className="text-xs text-slate-400 font-medium">mg/dL</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pain Level</p>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${lastCheckIn.painLevel > 5 ? 'bg-red-500' : 'bg-teal-500'}`}
                            style={{ width: `${lastCheckIn.painLevel * 10}%` }}
                          />
                        </div>
                        <span className="text-sm font-black text-slate-700">{lastCheckIn.painLevel}/10</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-slate-400 italic">No check-in data recorded yet.</div>
                )}
              </div>

              {/* Tips Section */}
              <div className="bg-teal-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-teal-900/10">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <h4 className="font-bold text-teal-100 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Monitoring Tips
                  </h4>
                  <ul className="space-y-3 text-teal-50/80 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5" />
                      Measure your blood pressure at the same time every day for consistency.
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5" />
                      Take your measurements while seated and relaxed for at least 5 minutes.
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5" />
                      Record any unusual symptoms or side effects in the notes section.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Plan Info Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 h-full">
                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-500" />
                  Your Active Plan
                </h4>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Protocol</p>
                    <p className="font-bold text-slate-800 text-lg leading-tight">{patient.followUpPlan.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-primary-600">Instructions</p>
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      "{patient.followUpPlan.description}"
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Start Date</p>
                      <p className="text-sm font-bold text-slate-700">{formatDate(patient.followUpPlan.startDate)}</p>
                    </div>
                    {patient.followUpPlan.endDate && (
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Target Date</p>
                        <p className="text-sm font-bold text-slate-700">{formatDate(patient.followUpPlan.endDate)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const MessagesContent = () => {
    const careTeam = [assignedDoctor, assignedNurse].filter(Boolean)

    if (selectedCareMember) {
      return (
        <div className="space-y-4 animate-fade-up">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedCareMember(null)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold text-slate-800">Chat with {selectedCareMember.name}</h3>
          </div>
          <ChatWindow 
            currentUser={user} 
            otherUser={selectedCareMember} 
            patientId={user.id} 
          />
        </div>
      )
    }

    return (
      <div className="space-y-6 animate-fade-up">
        <h3 className="text-xl font-semibold text-slate-800">Messages</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {careTeam.map((member) => (
            <div 
              key={member.id}
              onClick={() => setSelectedCareMember(member)}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-primary-300 transition-all cursor-pointer group flex items-center gap-4"
            >
              <div className="relative">
                <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full bg-slate-100 group-hover:ring-4 group-hover:ring-primary-50 transition-all" />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{member.name}</h4>
                  <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider bg-primary-50 px-2 py-0.5 rounded-full">
                    {member.role}
                  </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-1">
                  {member.role === 'doctor' ? member.specialty : member.department}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </div>
          ))}
        </div>

        {careTeam.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No care providers assigned yet</p>
            <p className="text-sm text-slate-400 mt-1">You will be able to message your doctor and nurse once they are assigned to your care.</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 animate-header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative cursor-pointer hover:bg-slate-100 p-2 rounded-full transition-colors group">
                <Bell 
                  className="w-6 h-6 text-slate-600 group-hover:text-primary-600 bell-animate" 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications && unreadNotifCount > 0) {
                      markNotificationsAsRead(user.id);
                      setLocalNotifications(notifications.filter(n => n.patientId === user.id));
                    }
                  }}
                />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {unreadNotifCount}
                  </span>
                )}
                
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 animate-scale-up overflow-hidden origin-top-right">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                      <h4 className="font-bold text-slate-800">Notifications</h4>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{systemName} AI</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {localNotifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                          <p className="text-slate-400 text-sm italic">No notifications yet</p>
                        </div>
                      ) : (
                        [...localNotifications].reverse().map(n => (
                          <div key={n.id} className={`p-4 border-b border-slate-50 last:border-none transition-colors ${n.read ? 'bg-white' : 'bg-primary-50/30'}`}>
                            <p className={`text-sm ${n.read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{formatDate(n.timestamp)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* New Check-In button removed */}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 min-h-screen">
          {activeTab === 'dashboard' && DashboardContent()}
          {activeTab === 'checkin' && CheckInContent()}
          {activeTab === 'history' && HistoryContent()}
          {activeTab === 'messages' && <MessagesContent />}
        </main>
      </div>

      {/* Check-in Modal */}
      {showCheckIn && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl animate-scale-up border border-white/20 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Daily Vitals Log</h3>
                <p className="text-slate-500 mt-1 font-medium">Record your measurements for {formatDate(new Date())}</p>
              </div>
              <button 
                onClick={() => setShowCheckIn(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl p-3 transition-all"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCheckInSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Systolic BP (High)</label>
                  <input
                    type="number"
                    required
                    value={checkInData.systolic}
                    onChange={(e) => setCheckInData({ ...checkInData, systolic: e.target.value })}
                    placeholder="120"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Diastolic BP (Low)</label>
                  <input
                    type="number"
                    required
                    value={checkInData.diastolic}
                    onChange={(e) => setCheckInData({ ...checkInData, diastolic: e.target.value })}
                    placeholder="80"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Pulse Rate (bpm)</label>
                  <input
                    type="number"
                    required
                    value={checkInData.pulse}
                    onChange={(e) => setCheckInData({ ...checkInData, pulse: e.target.value })}
                    placeholder="72"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 ml-1">Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    required
                    value={checkInData.bloodSugar}
                    onChange={(e) => setCheckInData({ ...checkInData, bloodSugar: e.target.value })}
                    placeholder="95"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-slate-700">Pain Level (0-10)</label>
                  <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${checkInData.painLevel > 7 ? 'bg-red-500' : checkInData.painLevel > 4 ? 'bg-amber-500' : 'bg-teal-500'}`}>
                    Level {checkInData.painLevel}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={checkInData.painLevel}
                  onChange={(e) => setCheckInData({ ...checkInData, painLevel: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  <span>No Pain</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 ml-1">Notes / Symptoms</label>
                <textarea
                  rows="3"
                  value={checkInData.notes}
                  onChange={(e) => setCheckInData({ ...checkInData, notes: e.target.value })}
                  placeholder="How are you feeling today? Any specific symptoms?"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium resize-none"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowCheckIn(false)}
                  className="flex-1 px-8 py-4 border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 active:scale-95"
                >
                  Submit Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientDashboard
