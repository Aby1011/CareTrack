import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import AdminDashboard from './pages/AdminDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import NurseDashboard from './pages/NurseDashboard'
import PatientDashboard from './pages/PatientDashboard'
import Register from './pages/Register'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import PersonalDetailsPage from './pages/PersonalDetailsPage'
import MaintenancePage from './pages/MaintenancePage'
import VerifyPrescription from './pages/VerifyPrescription'

import SmoothScroll from './components/SmoothScroll'
import CustomCursor from './components/CustomCursor'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [maintenanceMode, setMaintenanceMode] = useState(localStorage.getItem('caretrack_maintenance') === 'true')
  const [systemName, setSystemName] = useState(localStorage.getItem('caretrack_system_name') || 'CareTrack')

  useEffect(() => {
    const syncSettings = () => {
      setMaintenanceMode(localStorage.getItem('caretrack_maintenance') === 'true')
      setSystemName(localStorage.getItem('caretrack_system_name') || 'CareTrack')
    }
    window.addEventListener('storage', syncSettings)
    // Also check on a regular interval as a fallback
    const interval = setInterval(syncSettings, 2000)
    return () => {
      window.removeEventListener('storage', syncSettings)
      clearInterval(interval)
    }
  }, [])

  const handleLogin = (user) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    setCurrentUser(null)
  }

  // Redirect non-admins to maintenance page if active
  const isBlockedByMaintenance = maintenanceMode && currentUser?.role !== 'admin'

  return (
    <SmoothScroll>
      <CustomCursor />
      <Routes>
        <Route
          path="/login"
          element={!currentUser ? <Login onLogin={handleLogin} /> : <Navigate to={`/${currentUser.role}`} />}
        />
        <Route
          path="/register"
          element={!currentUser ? <Register /> : <Navigate to={`/${currentUser.role}`} />}
        />
        <Route path="/verify-prescription/:id" element={<VerifyPrescription />} />
        <Route
          path="/maintenance"
          element={<MaintenancePage />}
        />
        <Route
          path="/admin"
          element={currentUser?.role === 'admin' ? <AdminDashboard user={currentUser} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/doctor"
          element={isBlockedByMaintenance ? <Navigate to="/maintenance" /> : (currentUser?.role === 'doctor' ? <DoctorDashboard user={currentUser} onLogout={handleLogout} /> : <Navigate to="/login" />)}
        />
        <Route
          path="/nurse"
          element={isBlockedByMaintenance ? <Navigate to="/maintenance" /> : (currentUser?.role === 'nurse' ? <NurseDashboard user={currentUser} onLogout={handleLogout} /> : <Navigate to="/login" />)}
        />
        <Route
          path="/patient"
          element={isBlockedByMaintenance ? <Navigate to="/maintenance" /> : (currentUser?.role === 'patient' ? <PatientDashboard user={currentUser} onLogout={handleLogout} /> : <Navigate to="/login" />)}
        />
        <Route
          path="/profile"
          element={isBlockedByMaintenance ? <Navigate to="/maintenance" /> : (currentUser ? <ProfilePage user={currentUser} onLogout={handleLogout} /> : <Navigate to="/login" />)}
        />
        <Route
          path="/settings"
          element={isBlockedByMaintenance ? <Navigate to="/maintenance" /> : (currentUser ? <SettingsPage /> : <Navigate to="/login" />)}
        />
        <Route
          path="/personal-details"
          element={isBlockedByMaintenance ? <Navigate to="/maintenance" /> : (currentUser ? <PersonalDetailsPage user={currentUser} /> : <Navigate to="/login" />)}
        />
        <Route path="/" element={maintenanceMode && currentUser?.role !== 'admin' ? <MaintenancePage /> : <Home />} />
      </Routes>
    </SmoothScroll>
  )
}

export default App
