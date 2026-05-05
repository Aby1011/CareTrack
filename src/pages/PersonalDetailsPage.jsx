import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Mail, Phone, MapPin, 
  Briefcase, Award, Heart, User, 
  Calendar, Shield, UserCircle
} from 'lucide-react'

function PersonalDetailsPage({ user }) {
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-lg font-medium">
        Loading details...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-primary-500 shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Personal Details</h1>
            <p className="text-slate-500">Full information for {user.name}</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar & Basic Info Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center">
              <div className="w-24 h-24 rounded-2xl mb-4 p-1 ring-2 ring-primary-50">
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl bg-slate-50" />
              </div>
              <h2 className="font-bold text-slate-800 text-center">{user.name}</h2>
              <div className="mt-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-black uppercase tracking-widest">
                {user.role}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 italic text-sm text-slate-500">
              "Providing transparency and security for your health data at CareTrack."
            </div>
          </div>

          {/* Details Sections */}
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8">
              {/* Contact Information */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <DetailItem label="Email Address" value={user.email} />
                  <DetailItem label="Phone Number" value={user.phone || 'N/A'} />
                  <DetailItem label="Permanent Address" value={user.address || 'N/A'} />
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Role Specific Details */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Professional & Account Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <DetailItem label="User ID" value={`#CT-${user.id}`} />
                  {user.role === 'doctor' && (
                    <>
                      <DetailItem label="Medical Specialty" value={user.specialty} />
                      <DetailItem label="License Registration" value={user.license} />
                    </>
                  )}
                  {user.role === 'nurse' && (
                    <>
                      <DetailItem label="Hospital Department" value={user.department} />
                      <DetailItem label="Nurse Qualification" value={user.qualification} />
                    </>
                  )}
                  {user.role === 'patient' && (
                    <>
                      <DetailItem label="Primary Condition" value={user.condition} />
                      <DetailItem label="Gender" value={user.gender} />
                      <DetailItem label="Age" value={user.age} />
                    </>
                  )}
                  <DetailItem label="Account Status" value="Verified & Active" />
                </div>
              </div>
            </section>

            {/* Verification Footer */}
            <div className="flex items-center justify-between px-8 py-4 bg-teal-50 rounded-2xl border border-teal-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-teal-800 font-bold uppercase">Identity Verified</p>
                  <p className="text-[10px] text-teal-600">Account verified by CareTrack Admin</p>
                </div>
              </div>
              <Shield className="w-5 h-5 text-teal-400 opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
      <p className="text-slate-800 font-medium">{value}</p>
    </div>
  )
}

export default PersonalDetailsPage
