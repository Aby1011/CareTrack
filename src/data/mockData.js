// Mock data for Patient Follow-Up System
import CryptoJS from 'crypto-js';

// Initial data
const initialUsers = {
  admin: {
    id: 1,
    name: 'Dr. Sarah Johnson',
    email: 'admin@system.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    isApproved: true,
  },
  doctors: [
    {
      id: 2,
      name: 'Dr. Michael Chen',
      email: 'dr.chen@system.com',
      role: 'doctor',
      specialty: 'Cardiology',
      phone: '+1 555-0201',
      license: 'MC-78901',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      patients: [101, 102, 103],
      isApproved: true,
      department: 'Cardiology',
      specialty: 'Cardiology',
      qualification: 'Doctor of Medicine (MD)',
      medicalRegistrationNumber: 'MCRN-123456',
      registeredAt: '2026-01-05T08:00:00Z',
    },
    {
      id: 3,
      name: 'Dr. Emily Watson',
      email: 'dr.watson@system.com',
      role: 'doctor',
      specialty: 'Orthopedics',
      phone: '+1 555-0202',
      license: 'EW-45678',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      patients: [104, 105],
      isApproved: true,
      department: 'Orthopedics',
      specialty: 'Orthopedics',
      qualification: 'Doctor of Osteopathic Medicine (DO)',
      medicalRegistrationNumber: 'MCRN-789012',
      registeredAt: '2026-01-08T11:45:00Z',
    },
  ],
  nurses: [
    {
      id: 4,
      name: 'Nurse Jessica Brown',
      email: 'nurse.brown@system.com',
      role: 'nurse',
      phone: '+1 555-0301',
      department: 'Cardiology',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
      assignedPatients: [101, 102, 103, 104, 105],
      isApproved: true,
      registeredAt: '2026-01-10T09:00:00Z',
      qualification: 'GNM Nursing',
      knmcRegistrationNumber: 'KNMC-67890',
      qualificationCertificate: 'MOCK_CERTIFICATE_JESSICA_BASE64_PLACEHOLDER'
    },
    {
      id: 5,
      name: 'Nurse David Lee',
      email: 'nurse.lee@system.com',
      role: 'nurse',
      phone: '+1 555-0302',
      department: 'General Medicine',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      assignedPatients: [106, 107, 108],
      isApproved: true,
      registeredAt: '2026-01-12T14:30:00Z',
      qualification: 'BSc Nursing',
      knmcRegistrationNumber: 'KNMC-12345',
      qualificationCertificate: 'MOCK_CERTIFICATE_DAVID_BASE64_PLACEHOLDER'
    },
  ],
  patients: [
    {
      id: 101,
      name: 'John Smith',
      role: 'patient',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      age: 58,
      gender: 'Male',
      email: 'john.smith.p101@email.com',
      phone: '+1 555-0101',
      condition: 'Post-Cardiac Surgery',
      doctorId: 2,
      nurseId: 4,
      status: 'critical',
      lastCheckIn: '2026-03-16',
      adherence: 85,
      isApproved: true,
      registrationStatus: 'Approved',
    },
    {
      id: 102,
      name: 'Maria Garcia',
      role: 'patient',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      age: 45,
      gender: 'Female',
      email: 'maria.garcia@email.com',
      phone: '+1 555-0102',
      condition: 'Hypertension Management',
      doctorId: 2,
      nurseId: 4,
      status: 'stable',
      lastCheckIn: '2026-03-16',
      adherence: 95,
      isApproved: true,
      registrationStatus: 'Approved',
    },
    {
      id: 103,
      name: 'Robert Wilson',
      role: 'patient',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
      age: 72,
      gender: 'Male',
      email: 'robert.wilson@email.com',
      phone: '+1 555-0103',
      condition: 'Diabetes Type 2',
      doctorId: 2,
      nurseId: 4,
      status: 'at-risk',
      lastCheckIn: '2026-02-15',
      adherence: 78,
      isApproved: true,
      registrationStatus: 'Approved',
    },
    {
      id: 104,
      name: 'Jennifer Davis',
      role: 'patient',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
      age: 34,
      gender: 'Female',
      email: 'jennifer.davis@email.com',
      phone: '+1 555-0104',
      condition: 'Post-Knee Replacement',
      doctorId: 3,
      nurseId: 4,
      status: 'stable',
      lastCheckIn: '2026-02-16',
      adherence: 95,
      isApproved: true,
      registrationStatus: 'Approved',
    },
    {
      id: 105,
      name: 'Thomas Anderson',
      role: 'patient',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas',
      age: 67,
      gender: 'Male',
      email: 'thomas.anderson@email.com',
      phone: '+1 555-0105',
      condition: 'Hip Replacement Recovery',
      doctorId: 3,
      nurseId: 4,
      status: 'stable',
      lastCheckIn: '2026-02-16',
      adherence: 88,
      isApproved: true,
      registrationStatus: 'Approved',
    },
    {
      id: 106,
      name: 'Patricia Martinez',
      role: 'patient',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia',
      age: 55,
      gender: 'Female',
      email: 'patricia.martinez@email.com',
      phone: '+1 555-0106',
      condition: 'Hypertension',
      doctorId: 2,
      nurseId: 5,
      status: 'stable',
      lastCheckIn: '2026-02-16',
      adherence: 90,
      isApproved: true,
      registrationStatus: 'Approved',
    },
    {
      id: 107,
      name: 'James Brown',
      role: 'patient',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      age: 49,
      gender: 'Male',
      email: 'james.brown@email.com',
      phone: '+1 555-0107',
      condition: 'Post-Surgery Recovery',
      doctorId: 3,
      nurseId: 5,
      status: 'at-risk',
      lastCheckIn: '2026-02-14',
      adherence: 65,
      isApproved: true,
      registrationStatus: 'Approved',
    },
    {
      id: 108,
      name: 'Linda Johnson',
      role: 'patient',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Linda',
      age: 62,
      gender: 'Female',
      email: 'linda.johnson@email.com',
      phone: '+1 555-0108',
      condition: 'Heart Failure Management',
      doctorId: 2,
      nurseId: 5,
      status: 'critical',
      lastCheckIn: '2026-05-04',
      adherence: 82,
      isApproved: true,
      registrationStatus: 'Approved',
    },
  ],
};

export const vitalRecords = [
  // John Smith (101) - Critical
  { patientId: 101, date: '2026-02-10', systolic: 145, diastolic: 92, pulse: 98, bloodSugar: 142, painLevel: 6, notes: 'Feeling tired' },
  { patientId: 101, date: '2026-02-11', systolic: 152, diastolic: 95, pulse: 102, bloodSugar: 155, painLevel: 7, notes: 'Chest discomfort' },
  { patientId: 101, date: '2026-02-12', systolic: 148, diastolic: 90, pulse: 96, bloodSugar: 138, painLevel: 5, notes: 'Better today' },
  { patientId: 101, date: '2026-02-13', systolic: 158, diastolic: 98, pulse: 108, bloodSugar: 162, painLevel: 8, notes: 'Shortness of breath' },
  { patientId: 101, date: '2026-02-14', systolic: 142, diastolic: 88, pulse: 94, bloodSugar: 135, painLevel: 4, notes: 'Resting' },
  { patientId: 101, date: '2026-02-15', systolic: 155, diastolic: 96, pulse: 105, bloodSugar: 148, painLevel: 7, notes: 'High stress' },
  { patientId: 101, date: '2026-02-16', systolic: 162, diastolic: 100, pulse: 110, bloodSugar: 165, painLevel: 8, notes: 'Critical - needs attention' },

  // Maria Garcia (102) - Stable
  { patientId: 102, date: '2026-02-10', systolic: 128, diastolic: 82, pulse: 78, bloodSugar: 118, painLevel: 2, notes: 'Normal' },
  { patientId: 102, date: '2026-02-11', systolic: 125, diastolic: 80, pulse: 75, bloodSugar: 115, painLevel: 1, notes: 'Good day' },
  { patientId: 102, date: '2026-02-12', systolic: 130, diastolic: 84, pulse: 80, bloodSugar: 120, painLevel: 2, notes: 'Regular check' },
  { patientId: 102, date: '2026-02-13', systolic: 126, diastolic: 81, pulse: 76, bloodSugar: 116, painLevel: 1, notes: 'Feeling well' },
  { patientId: 102, date: '2026-02-14', systolic: 122, diastolic: 78, pulse: 72, bloodSugar: 112, painLevel: 1, notes: 'Excellent' },
  { patientId: 102, date: '2026-02-15', systolic: 128, diastolic: 82, pulse: 77, bloodSugar: 118, painLevel: 2, notes: 'Normal readings' },
  { patientId: 102, date: '2026-02-16', systolic: 125, diastolic: 80, pulse: 75, bloodSugar: 115, painLevel: 1, notes: 'Stable' },

  // Robert Wilson (103) - At Risk
  { patientId: 103, date: '2026-02-10', systolic: 138, diastolic: 88, pulse: 88, bloodSugar: 195, painLevel: 3, notes: 'Sugar slightly high' },
  { patientId: 103, date: '2026-02-11', systolic: 142, diastolic: 90, pulse: 92, bloodSugar: 210, painLevel: 4, notes: 'High sugar levels' },
  { patientId: 103, date: '2026-02-12', systolic: 135, diastolic: 85, pulse: 85, bloodSugar: 188, painLevel: 3, notes: 'Better' },
  { patientId: 103, date: '2026-02-13', systolic: 145, diastolic: 92, pulse: 94, bloodSugar: 225, painLevel: 5, notes: 'Concerning levels' },
  { patientId: 103, date: '2026-02-14', systolic: 140, diastolic: 89, pulse: 90, bloodSugar: 198, painLevel: 3, notes: 'Medication adjusted' },
  { patientId: 103, date: '2026-02-15', systolic: 138, diastolic: 87, pulse: 88, bloodSugar: 205, painLevel: 4, notes: 'Monitoring closely' },
  { patientId: 103, date: '2026-02-16', systolic: 142, diastolic: 90, pulse: 91, bloodSugar: 215, painLevel: 4, notes: 'Needs review' },

  // Jennifer Davis (104) - Stable
  { patientId: 104, date: '2026-02-10', systolic: 118, diastolic: 75, pulse: 72, bloodSugar: 105, painLevel: 4, notes: 'Mobility exercises done' },
  { patientId: 104, date: '2026-02-11', systolic: 120, diastolic: 76, pulse: 70, bloodSugar: 102, painLevel: 3, notes: 'Less pain today' },
  { patientId: 104, date: '2026-02-12', systolic: 116, diastolic: 74, pulse: 68, bloodSugar: 98, painLevel: 2, notes: 'Good progress' },
  { patientId: 104, date: '2026-02-13', systolic: 118, diastolic: 75, pulse: 71, bloodSugar: 100, painLevel: 3, notes: 'Walking more' },
  { patientId: 104, date: '2026-02-14', systolic: 115, diastolic: 73, pulse: 68, bloodSugar: 96, painLevel: 2, notes: 'Physical therapy' },
  { patientId: 104, date: '2026-02-15', systolic: 117, diastolic: 74, pulse: 69, bloodSugar: 99, painLevel: 2, notes: 'Recovering well' },
  { patientId: 104, date: '2026-02-16', systolic: 116, diastolic: 74, pulse: 70, bloodSugar: 98, painLevel: 2, notes: 'On track' },

  // Thomas Anderson (105) - Stable
  { patientId: 105, date: '2026-02-10', systolic: 128, diastolic: 82, pulse: 80, bloodSugar: 120, painLevel: 5, notes: 'Hip feeling better' },
  { patientId: 105, date: '2026-02-11', systolic: 130, diastolic: 83, pulse: 82, bloodSugar: 122, painLevel: 4, notes: 'Can walk shorter distances' },
  { patientId: 105, date: '2026-02-12', systolic: 126, diastolic: 80, pulse: 78, bloodSugar: 118, painLevel: 4, notes: 'Good day' },
  { patientId: 105, date: '2026-02-13', systolic: 128, diastolic: 82, pulse: 80, bloodSugar: 120, painLevel: 3, notes: 'Physical therapy progressing' },
  { patientId: 105, date: '2026-02-14', systolic: 125, diastolic: 79, pulse: 76, bloodSugar: 116, painLevel: 3, notes: 'Less swelling' },
  { patientId: 105, date: '2026-02-15', systolic: 127, diastolic: 81, pulse: 79, bloodSugar: 119, painLevel: 3, notes: 'Steady recovery' },
  { patientId: 105, date: '2026-02-16', systolic: 126, diastolic: 80, pulse: 78, bloodSugar: 117, painLevel: 2, notes: 'Good progress' },

  // Patricia Martinez (106) - Stable
  { patientId: 106, date: '2026-02-10', systolic: 135, diastolic: 86, pulse: 84, bloodSugar: 125, painLevel: 2, notes: 'BP slightly elevated' },
  { patientId: 106, date: '2026-02-11', systolic: 132, diastolic: 84, pulse: 82, bloodSugar: 122, painLevel: 2, notes: 'Taking medication regularly' },
  { patientId: 106, date: '2026-02-12', systolic: 130, diastolic: 82, pulse: 80, bloodSugar: 120, painLevel: 1, notes: 'Feeling better' },
  { patientId: 106, date: '2026-02-13', systolic: 128, diastolic: 81, pulse: 78, bloodSugar: 118, painLevel: 1, notes: 'Stable' },
  { patientId: 106, date: '2026-02-14', systolic: 126, diastolic: 80, pulse: 76, bloodSugar: 115, painLevel: 1, notes: 'Good readings' },
  { patientId: 106, date: '2026-02-15', systolic: 128, diastolic: 82, pulse: 78, bloodSugar: 118, painLevel: 2, notes: 'Normal' },
  { patientId: 106, date: '2026-02-16', systolic: 127, diastolic: 81, pulse: 77, bloodSugar: 116, painLevel: 1, notes: 'Stable' },

  // James Brown (107) - At Risk
  { patientId: 107, date: '2026-02-10', systolic: 132, diastolic: 84, pulse: 86, bloodSugar: 130, painLevel: 5, notes: 'Wound care done' },
  { patientId: 107, date: '2026-02-11', systolic: 128, diastolic: 82, pulse: 82, bloodSugar: 125, painLevel: 4, notes: 'Wound looking better' },
  { patientId: 107, date: '2026-02-12', systolic: 125, diastolic: 80, pulse: 80, bloodSugar: 122, painLevel: 4, notes: 'Stitches healing' },
  { patientId: 107, date: '2026-02-13', systolic: 130, diastolic: 83, pulse: 84, bloodSugar: 128, painLevel: 5, notes: 'Slight redness' },
  { patientId: 107, date: '2026-02-14', systolic: 135, diastolic: 86, pulse: 88, bloodSugar: 132, painLevel: 6, notes: 'Increased pain' },
  { patientId: 107, date: '2026-02-15', systolic: 138, diastolic: 88, pulse: 90, bloodSugar: 135, painLevel: 7, notes: 'Need to check wound' },
  { patientId: 107, date: '2026-02-16', systolic: 140, diastolic: 90, pulse: 92, bloodSugar: 138, painLevel: 7, notes: 'No update - concerning' },

  // Linda Johnson (108) - Critical
  { patientId: 108, date: '2026-02-10', systolic: 155, diastolic: 95, pulse: 102, bloodSugar: 145, painLevel: 6, notes: 'Fluid retention' },
  { patientId: 108, date: '2026-02-11', systolic: 160, diastolic: 98, pulse: 106, bloodSugar: 150, painLevel: 7, notes: 'Shortness of breath' },
  { patientId: 108, date: '2026-02-12', systolic: 150, diastolic: 92, pulse: 98, bloodSugar: 140, painLevel: 5, notes: 'Medication adjusted' },
  { patientId: 108, date: '2026-02-13', systolic: 165, diastolic: 100, pulse: 110, bloodSugar: 155, painLevel: 8, notes: 'Emergency call made' },
  { patientId: 108, date: '2026-02-14', systolic: 152, diastolic: 94, pulse: 100, bloodSugar: 142, painLevel: 5, notes: 'Hospital visit scheduled' },
  { patientId: 108, date: '2026-02-15', systolic: 158, diastolic: 96, pulse: 104, bloodSugar: 148, painLevel: 6, notes: 'Monitoring closely' },
  { patientId: 108, date: '2026-02-16', systolic: 162, diastolic: 98, pulse: 108, bloodSugar: 152, painLevel: 7, notes: 'Critical condition' },
];

const initialAlerts = [
  {
    id: 1,
    patientId: 101,
    type: 'critical',
    message: 'High blood pressure detected - Systolic: 162 mmHg',
    timestamp: '2026-02-16T09:30:00',
    acknowledged: false,
  },
  {
    id: 2,
    patientId: 108,
    type: 'critical',
    message: 'Critical vital signs - Heart rate elevated at 108 bpm',
    timestamp: '2026-02-16T08:15:00',
    acknowledged: false,
  },
  {
    id: 3,
    patientId: 103,
    type: 'warning',
    message: 'Blood sugar levels above threshold - 215 mg/dL',
    timestamp: '2026-02-16T07:45:00',
    acknowledged: true,
  },
  {
    id: 4,
    patientId: 107,
    type: 'warning',
    message: 'Missed check-in yesterday - No data received',
    timestamp: '2026-02-16T06:00:00',
    acknowledged: false,
  },
  {
    id: 5,
    patientId: 102,
    type: 'info',
    message: 'Check-in completed - All vitals within normal range',
    timestamp: '2026-02-15T20:30:00',
    acknowledged: true,
  },
];

const loadAlerts = () => {
  try {
    const saved = localStorage.getItem('caretrack_alerts');
    return saved ? JSON.parse(saved) : initialAlerts;
  } catch (e) {
    return initialAlerts;
  }
};

export const saveAlerts = () => {
  localStorage.setItem('caretrack_alerts', JSON.stringify(alerts));
  window.dispatchEvent(new Event('storage'));
};

export const acknowledgeAlert = (alertId, doctorName) => {
  const alert = alerts.find(a => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
    alert.acknowledgedBy = doctorName;
    alert.acknowledgedAt = new Date().toISOString();
    saveAlerts();
    return alert;
  }
  return null;
};

export const alerts = loadAlerts();

const loadMessages = () => {
  try {
    const saved = localStorage.getItem('caretrack_messages');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        from: 'Nurse Jessica Brown',
        fromId: 4,
        to: 'Dr. Michael Chen',
        toId: 2,
        patientId: 101,
        subject: 'John Smith - Critical Alert',
        message: 'Patient showing elevated BP readings for the past 3 days. Recommend immediate review.',
        timestamp: '2026-02-16T10:00:00',
        read: false,
      },
      {
        id: 2,
        from: 'John Smith',
        fromId: 101,
        to: 'Nurse Jessica Brown',
        toId: 4,
        patientId: 101,
        subject: 'Question about medication',
        message: 'Should I take my medication with food or on an empty stomach?',
        timestamp: '2026-02-16T08:30:00',
        read: true,
      },
      {
        id: 3,
        from: 'Dr. Michael Chen',
        fromId: 2,
        to: 'Linda Johnson',
        toId: 108,
        patientId: 108,
        subject: 'Follow-up Appointment',
        message: 'Please come in for a follow-up appointment tomorrow at 10 AM.',
        timestamp: '2026-02-15T14:00:00',
        read: true,
      },
    ];
  } catch (e) {
    return [];
  }
};

export const messages = loadMessages();

export const saveMessages = () => {
  localStorage.setItem('caretrack_messages', JSON.stringify(messages));
  // Dispatch event for cross-tab sync
  window.dispatchEvent(new Event('storage'));
};

export const addMessage = (messageData) => {
  const newId = messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1;
  const newMessage = {
    ...messageData,
    id: newId,
    timestamp: new Date().toISOString(),
    read: false,
  };
  messages.push(newMessage);
  saveMessages();
  return newMessage;
};

export const markMessagesAsRead = (viewerId, otherId) => {
  let changed = false;
  messages.forEach(m => {
    if (m.toId === viewerId && m.fromId === otherId && !m.read) {
      m.read = true;
      changed = true;
    }
  });
  if (changed) saveMessages();
};

export const getUnreadCount = (userId) => {
  return messages.filter(m => m.toId === userId && !m.read).length;
};

// Patient Notifications
const initialNotifications = [
  { id: 1, patientId: 101, message: 'Your account has been approved by Dr. Michael Chen.', timestamp: '2026-01-15T10:00:00Z', read: true },
  { id: 2, patientId: 101, message: 'Welcome to CareTrack! Please complete your first check-in.', timestamp: '2026-01-15T10:05:00Z', read: false },
];

const loadNotifications = () => {
  try {
    const saved = localStorage.getItem('caretrack_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  } catch (e) {
    return initialNotifications;
  }
};

export const saveNotifications = () => {
  localStorage.setItem('caretrack_notifications', JSON.stringify(notifications));
  window.dispatchEvent(new Event('storage'));
};

export const notifications = loadNotifications();

export const addNotification = (patientId, message) => {
  const newId = notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1;
  const newNotif = {
    id: newId,
    patientId,
    message,
    timestamp: new Date().toISOString(),
    read: false,
  };
  notifications.push(newNotif);
  saveNotifications();
  return newNotif;
};

export const markNotificationsAsRead = (patientId) => {
  let changed = false;
  notifications.forEach(n => {
    if (String(n.patientId) === String(patientId) && !n.read) {
      n.read = true;
      changed = true;
    }
  });
  if (changed) saveNotifications();
};

// Removed followUpPlans module

export const alertThresholds = {
  systolic: { min: 90, max: 140, unit: 'mmHg' },
  diastolic: { min: 60, max: 90, unit: 'mmHg' },
  pulse: { min: 60, max: 100, unit: 'bpm' },
  bloodSugar: { min: 70, max: 180, unit: 'mg/dL' },
  painLevel: { min: 0, max: 10, unit: 'scale' },
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'at-risk':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'stable':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getAlertColor = (type) => {
  switch (type) {
    case 'critical':
      return 'bg-red-50 border-red-200 text-red-700';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    case 'info':
      return 'bg-blue-50 border-blue-200 text-blue-700';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-700';
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

// Helper functions for mock data manipulation
export const addDoctor = (doctorData) => {
  const newId = users.doctors.length > 0 ? Math.max(...users.doctors.map(d => d.id)) + 1 : 201;
  const newDoctor = {
    ...doctorData,
    id: newId,
    role: 'doctor',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctorData.name}`,
    patients: [],
    isApproved: false, // Default to unapproved for self-registration
    registrationStatus: 'Pending',
    registeredAt: new Date().toISOString(),
  };
  users.doctors.push(newDoctor);
  saveUsers();
  return newDoctor;
};

export const addNurse = (nurseData) => {
  const newId = users.nurses.length > 0 ? Math.max(...users.nurses.map(n => n.id)) + 1 : 301;
  const newNurse = {
    ...nurseData,
    id: newId,
    role: 'nurse',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nurseData.name}`,
    assignedPatients: [],
    registeredAt: new Date().toISOString(),
    qualification: nurseData.qualification || '',
    knmcRegistrationNumber: nurseData.knmcRegistrationNumber || '',
    qualificationCertificate: nurseData.qualificationCertificate || null,
    isApproved: false, // Default to unapproved for self-registration
  };
  users.nurses.push(newNurse);
  saveUsers();
  return newNurse;
};

export const addPatient = (patientData) => {
  const newId = users.patients.length > 0 ? Math.max(...users.patients.map(p => p.id)) + 1 : 1001;
  const newPatient = {
    ...patientData,
    id: newId,
    role: 'patient',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${patientData.name}`,
    status: 'stable',
    enrollDate: new Date().toISOString().split('T')[0],
    registeredAt: new Date().toISOString(), // Full date and time
    consultationReason: patientData.consultationReason || '',
    lastCheckIn: null,
    adherence: 100,
    isFirstLogin: patientData.isFirstLogin !== undefined ? patientData.isFirstLogin : true,
    isApproved: patientData.isApproved !== undefined ? patientData.isApproved : false, // Default to unapproved for self-registration
    registrationStatus: patientData.isApproved ? 'Approved' : 'Pending',
  };
  users.patients.push(newPatient);
  saveUsers();
  return newPatient;
};

/**
 * API-mimicking function to update patient data.
 * In a real Django backend, this would be a PATCH/PUT request to /api/patients/{id}/
 */
export const updatePatient = (patientId, updatedData) => {
  // Find patient in the global store
  const index = users.patients.findIndex(p => String(p.id) === String(patientId));
  if (index !== -1) {
    // Basic merge of updated data
    users.patients[index] = { 
      ...users.patients[index], 
      ...updatedData
    };
    
    // PERSISTENCE: Save to localStorage (our mock database)
    saveUsers();
    
    // Return the fresh data
    return { ...users.patients[index] };
  }
  
  console.warn(`updatePatient: Patient ID ${patientId} not found.`);
  return null;
};

export const dischargePatient = (patientId, doctorName) => {
  const patient = users.patients.find(p => p.id === patientId);
  if (patient) {
    patient.previousDoctorId = patient.doctorId;
    patient.doctorId = null;
    patient.nurseId = null; // Unassign nurse as well on discharge
    patient.status = 'discharged';
    patient.dischargedAt = new Date().toISOString();
    patient.dischargedBy = doctorName;
    
    // Log in audit (as a notification for now)
    addNotification(patientId, `You have been discharged from active follow-up by ${doctorName}. Your records are preserved.`);
    
    saveUsers();
    return true;
  }
  return false;
};

export const deactivatePatient = (patientId) => {
  const patient = users.patients.find(p => p.id === patientId);
  if (patient) {
    patient.status = 'deactivated';
    patient.deactivatedAt = new Date().toISOString();
    saveUsers();
    return true;
  }
  return false;
};

export const reactivatePatient = (patientId) => {
  const patient = users.patients.find(p => p.id === patientId);
  if (patient) {
    patient.status = 'stable'; // Reset to stable on reactivation
    patient.reactivatedAt = new Date().toISOString();
    saveUsers();
    return true;
  }
  return false;
};

export const deletePatientPermanently = (patientId) => {
  const initialLength = users.patients.length;
  users.patients = users.patients.filter(p => p.id !== patientId);
  if (users.patients.length < initialLength) {
    saveUsers();
    return true;
  }
  return false;
};

// Persistence helpers
export const loadUsers = () => {
  try {
    const saved = localStorage.getItem('caretrack_users');
    if (!saved) return initialUsers;
    
    const parsed = JSON.parse(saved);
    
    // Migration: Ensure all approved doctors/nurses have 'Approved' status
    if (parsed.doctors) {
      parsed.doctors.forEach(d => {
        if (d.isApproved && d.registrationStatus !== 'Approved') {
          d.registrationStatus = 'Approved';
        }
      });
    }
    if (parsed.nurses) {
      parsed.nurses.forEach(n => {
        if (n.isApproved && n.registrationStatus !== 'Approved') {
          n.registrationStatus = 'Approved';
        }
      });
    }

    if (parsed.patients) {
      parsed.patients.forEach(p => {
        if (p.isApproved && p.registrationStatus !== 'Approved') {
          p.registrationStatus = 'Approved';
        }
      });
    }

    // Ensure all required arrays exist to prevent crashes on newer schema
    return {
      admin: parsed.admin || initialUsers.admin,
      doctors: parsed.doctors || [],
      nurses: parsed.nurses || [],
      patients: parsed.patients || []
    };
  } catch (e) {
    return initialUsers;
  }
};

export const saveUsers = () => {
  localStorage.setItem('caretrack_users', JSON.stringify(users));
  // Dispatch with a detail to distinguish from browser-triggered storage events
  const event = new CustomEvent('caretrack_sync', { detail: { key: 'caretrack_users', data: users } });
  window.dispatchEvent(event);
  window.dispatchEvent(new Event('storage'));
};

export const users = loadUsers();

// Sync users object across tabs/instances
if (typeof window !== 'undefined') {
  const syncHandler = (e) => {
    if (e.key === 'caretrack_users' || !e.key || e.type === 'caretrack_sync') {
      const freshUsers = e.detail?.data || loadUsers();
      // Use Object.assign to update the existing exported reference
      Object.assign(users, freshUsers);
    }
    if (e.key === 'caretrack_notifications' || !e.key || e.type === 'caretrack_sync') {
      const freshNotifs = loadNotifications();
      notifications.length = 0;
      notifications.push(...freshNotifs);
    }
  };
  window.addEventListener('storage', syncHandler);
  window.addEventListener('caretrack_sync', syncHandler);
}

export const addAlert = (alertData) => {
  const newId = alerts.length > 0 ? Math.max(...alerts.map(a => a.id)) + 1 : 1;
  const newAlert = {
    ...alertData,
    id: newId,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  };
  alerts.push(newAlert);
  saveAlerts();
  return newAlert;
};

export const checkVitalsForAlerts = (patientId, vitals) => {
  const patient = users.patients.find(p => p.id === patientId);
  if (!patient) return;

  const { systolic, diastolic, pulse, bloodSugar, painLevel } = vitals;
  const issues = [];
  let severity = 'info';

  // Systolic BP check
  if (systolic > 160 || systolic < 80) {
    issues.push(`Critical Blood Pressure: ${systolic} mmHg (Systolic)`);
    severity = 'critical';
  } else if (systolic > 140 || systolic < 90) {
    issues.push(`Elevated Blood Pressure: ${systolic} mmHg (Systolic)`);
    if (severity !== 'critical') severity = 'warning';
  }

  // Diastolic BP check
  if (diastolic > 100 || diastolic < 55) {
    issues.push(`Critical Blood Pressure: ${diastolic} mmHg (Diastolic)`);
    severity = 'critical';
  } else if (diastolic > 90 || diastolic < 60) {
    issues.push(`Abnormal Blood Pressure: ${diastolic} mmHg (Diastolic)`);
    if (severity !== 'critical') severity = 'warning';
  }

  // Pulse check
  if (pulse > 110 || pulse < 50) {
    issues.push(`Critical Heart Rate: ${pulse} bpm`);
    severity = 'critical';
  } else if (pulse > 100 || pulse < 60) {
    issues.push(`Abnormal Heart Rate: ${pulse} bpm`);
    if (severity !== 'critical') severity = 'warning';
  }

  // Blood Sugar check
  if (bloodSugar > 250 || bloodSugar < 60) {
    issues.push(`Critical Blood Sugar: ${bloodSugar} mg/dL`);
    severity = 'critical';
  } else if (bloodSugar > 180 || bloodSugar < 70) {
    issues.push(`High Blood Sugar: ${bloodSugar} mg/dL`);
    if (severity !== 'critical') severity = 'warning';
  }

  // Pain Level check
  if (painLevel >= 8) {
    issues.push(`Severe Pain Level: ${painLevel}/10`);
    severity = 'critical';
  } else if (painLevel >= 5) {
    issues.push(`Moderate Pain Level: ${painLevel}/10`);
    if (severity !== 'critical') severity = 'warning';
  }

  if (issues.length > 0) {
    // Update patient status
    patient.status = severity === 'critical' ? 'critical' : 'at-risk';
    saveUsers();

    // Create alert
    addAlert({
      patientId,
      type: severity,
      message: issues.join('. '),
    });

    // Create notification for patient
    addNotification(patientId, `Your latest vitals have triggered a ${severity} alert. Your care team has been notified.`);
  } else {
    // Return to stable if everything is fine
    patient.status = 'stable';
    saveUsers();
    
    addAlert({
      patientId,
      type: 'info',
      message: 'Daily vitals check-in completed. All values within normal range.',
    });
  }
};

export const addVitalRecord = (patientId, recordData) => {
  const newRecord = {
    ...recordData,
    patientId,
    date: new Date().toISOString().split('T')[0],
  };
  vitalRecords.push(newRecord);
  
  // Also update patient's lastCheckIn
  const patientIndex = users.patients.findIndex(p => p.id === patientId);
  if (patientIndex !== -1) {
    users.patients[patientIndex].lastCheckIn = newRecord.date;
    saveUsers();
    
    // Check for alerts automatically
    checkVitalsForAlerts(patientId, newRecord);
  }
  
  localStorage.setItem('caretrack_vitals', JSON.stringify(vitalRecords));
  window.dispatchEvent(new Event('storage'));
  return newRecord;
};

export const assignNurseToPatient = (patientId, nurseId) => {
  const patient = users.patients.find(p => p.id === patientId);
  const nurse = users.nurses.find(n => n.id === nurseId);

  if (patient && nurse) {
    // Assign nurse to patient
    patient.nurseId = nurseId;

    // Assign patient to nurse (if not already assigned)
    if (!nurse.assignedPatients.includes(patientId)) {
      nurse.assignedPatients.push(patientId);
    }
    saveUsers();
    return true;
  }
  return false;
};

// Follow-Up Plan API Mocks
export const followUpPlanAPI = {
  create: (patientId, planData) => {
    const patients = users.patients;
    const patientIndex = patients.findIndex(p => String(p.id) === String(patientId));
    if (patientIndex > -1) {
      patients[patientIndex].followUpPlan = {
        ...planData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        adherence: 100
      };
      saveUsers();
      window.dispatchEvent(new CustomEvent('caretrack_sync', { detail: { type: 'plan_update', patientId } }));
      return true;
    }
    return false;
  },
  get: (patientId) => {
    const patient = users.patients.find(p => String(p.id) === String(patientId));
    return patient?.followUpPlan || null;
  },
  update: (patientId, planData) => {
    const patients = users.patients;
    const patientIndex = patients.findIndex(p => String(p.id) === String(patientId));
    if (patientIndex > -1) {
      patients[patientIndex].followUpPlan = {
        ...patients[patientIndex].followUpPlan,
        ...planData,
        updatedAt: new Date().toISOString()
      };
      saveUsers();
      window.dispatchEvent(new CustomEvent('caretrack_sync', { detail: { type: 'plan_update', patientId } }));
      return true;
    }
    return false;
  }
};

export const canSubmitCheckIn = (patientId) => {
  const patient = users.patients.find(p => String(p.id) === String(patientId));
  if (!patient?.followUpPlan) return false;
  
  const patientVitals = vitalRecords.filter(v => v.patientId === patientId);
  if (patientVitals.length === 0) return true;
  
  const lastRecord = patientVitals[patientVitals.length - 1];
  const lastDate = new Date(lastRecord.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);
  
  return today > lastDate;
};

export let prescriptions = JSON.parse(localStorage.getItem('caretrack_prescriptions')) || [];

export const prescriptionAPI = {
  create: (patientId, doctorId, medicineData) => {
    const id = `rx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();
    
    const dataString = `${patientId}${doctorId}${medicineData.medicineName}${medicineData.dosage}${createdAt}`;
    const signature = CryptoJS.SHA256(dataString).toString();
    
    const prescription = {
      id,
      patientId,
      doctorId,
      medicineName: medicineData.medicineName,
      dosage: medicineData.dosage,
      frequency: medicineData.frequency,
      duration: medicineData.duration,
      instructions: medicineData.notes,
      createdAt,
      signature
    };
    
    prescriptions.push(prescription);
    localStorage.setItem('caretrack_prescriptions', JSON.stringify(prescriptions));
    window.dispatchEvent(new CustomEvent('caretrack_sync', { detail: { type: 'prescription_update', patientId } }));
    return prescription;
  },
  
  verify: (id) => {
    const rx = prescriptions.find(p => p.id === id);
    if (!rx) return { valid: false, message: "Prescription not found" };
    
    const dataString = `${rx.patientId}${rx.doctorId}${rx.medicineName}${rx.dosage}${rx.createdAt}`;
    const calculatedSignature = CryptoJS.SHA256(dataString).toString();
    
    if (calculatedSignature === rx.signature) {
      return { valid: true, data: rx };
    }
    return { valid: false, message: "Invalid or Tampered Prescription" };
  },

  getPatientPrescriptions: (patientId) => {
    return prescriptions.filter(p => String(p.patientId) === String(patientId));
  }
};
