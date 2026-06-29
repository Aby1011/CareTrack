import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loadUsers, saveUsers, users } from '../data/mockData'
import { Heart, Mail, Lock, Eye, EyeOff, AlertCircle, Home } from 'lucide-react'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const [tempUser, setTempUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [systemName, setSystemName] = useState(localStorage.getItem('caretrack_system_name') || 'CareTrack')

  // allUsers is built fresh inside handleSubmit to avoid stale approval data

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Always read fresh from localStorage so admin approvals are immediately visible
    const freshUsers = loadUsers()
    const allUsers = [
      freshUsers.admin,
      ...freshUsers.doctors,
      ...freshUsers.nurses,
      ...freshUsers.patients
    ]

    // Find user by email
    const user = allUsers.find(u => u.email === email)

    const isMaintenance = localStorage.getItem('caretrack_maintenance') === 'true'
    if (isMaintenance && user?.role !== 'admin') {
      setError('System is under maintenance. Please try again later.')
      setLoading(false)
      return
    }

    if (!user) {
      setError('Invalid email address. Please try again.')
      setLoading(false)
      return
    }

    // Simple password check (for demo, any user with 'password123' or their specific 'tempPassword' or custom 'password' works)
    const isValidPassword = password === 'password123' ||
      (user.tempPassword && password === user.tempPassword) ||
      (user.password && password === user.password)

    if (!isValidPassword) {
      setError('Invalid password. For demo, use: password123')
      setLoading(false)
      return
    }

    if (!user.isApproved) {
      setError('Your account is pending approval. Please check back later.')
      setLoading(false)
      return
    }

    if (user.isFirstLogin) {
      setIsFirstLogin(true)
      setTempUser(user)
      setLoading(false)
      return
    }

    onLogin(user)
    navigate(`/${user.role}`)
    setLoading(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))

    // Find the REAL record inside the module-level users store and update it there,
    // because tempUser came from a fresh loadUsers() parse — a different object reference.
    // saveUsers() persists the module-level `users` object, so we must mutate that.
    const allStoreUsers = [
      users.admin,
      ...users.doctors,
      ...users.nurses,
      ...users.patients
    ]
    const realUser = allStoreUsers.find(u => u && u.id === tempUser.id)
    if (realUser) {
      realUser.isFirstLogin = false
      realUser.password = newPassword
      delete realUser.tempPassword
    }
    saveUsers()

    // Also update tempUser so onLogin receives the correct state
    const updatedUser = { ...tempUser, isFirstLogin: false, password: newPassword }
    delete updatedUser.tempPassword

    onLogin(updatedUser)
    navigate(`/${updatedUser.role}`)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative">
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-xl transition-all duration-200 group z-50"
      >
        <Home className="w-4 h-4" />
        <span className="text-sm font-medium">Home</span>
      </Link>
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4 shadow-lg shadow-primary-500/30">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{systemName}</h1>
          <p className="text-slate-400 text-lg">Remote Patient Follow-Up System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-2 text-center">Welcome Back</h2>
            <p className="text-slate-500 text-center mb-6">Sign in to access your dashboard</p>

            {isFirstLogin ? (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                  <p className="text-yellow-800 text-sm flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>First Login: Please set a new secure password.</span>
                  </p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="At least 8 characters"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="Repeat new password"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-primary-500/20"
                  >
                    {loading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : 'Update Password & Login'}
                  </button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-500 border-slate-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-slate-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Forgot password?
                  </a>
                </div>

                {/* Error Message */}
                {error && (
                  <div className={`p-3 rounded-xl flex items-center gap-2 border ${
                    error.includes('pending approval') 
                      ? 'bg-green-50 border-green-200 text-green-600' 
                      : 'bg-red-50 border-red-200 text-red-600'
                  }`}>
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            )}

            {/* Registration Link */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
                  Create Account
                </Link>
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Secure healthcare platform | HIPAA Compliant
        </p>
      </div>
    </div>
  )
}

export default Login
