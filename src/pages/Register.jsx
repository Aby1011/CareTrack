import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Heart, User, Mail, Phone, Lock, Shield,
    Stethoscope, Briefcase, PlusCircle, ArrowLeft,
    CheckCircle, AlertCircle, ArrowRight, Activity, Home
} from 'lucide-react';
import { addDoctor, addNurse, addPatient } from '../data/mockData';

const Register = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('patient'); // Default role
    const [step, setStep] = useState(1); // For nurse multi-step
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        // Role specific fields
        department: '',
        age: '',
        gender: 'Male',
        consultationReason: '',
        // Professional verification (Both Nurse and Doctor)
        qualification: '',
        knmcRegistrationNumber: '',
        medicalRegistrationNumber: '',
        qualificationCertificate: null
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [systemName, setSystemName] = useState(localStorage.getItem('caretrack_system_name') || 'CareTrack');

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'qualificationCertificate') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        setError('');
        
        // Basic validation for Step 1
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
            setError('Please fill in all basic registration fields.');
            return;
        }

        if (role === 'doctor' && !formData.department) {
            setError('Please select your department.');
            return;
        }

        if (role === 'nurse' && !formData.department) {
            setError('Please select your department.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (role !== 'nurse' && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            if (role === 'doctor') {
                let certificateBase64 = null;
                
                if (formData.qualificationCertificate && formData.qualificationCertificate instanceof File) {
                    try {
                        certificateBase64 = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = (err) => reject(err);
                            reader.readAsDataURL(formData.qualificationCertificate);
                        });
                    } catch (fileErr) {
                        console.error('File reading failed:', fileErr);
                        setError('Failed to process the certificate file. Please try again.');
                        return;
                    }
                }

                addDoctor({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    department: formData.department,
                    specialty: formData.department, // Use department as specialty
                    password: formData.password,
                    qualification: formData.qualification,
                    medicalRegistrationNumber: formData.medicalRegistrationNumber,
                    qualificationCertificate: certificateBase64
                });
            } else if (role === 'nurse') {
                let certificateBase64 = null;
                
                if (formData.qualificationCertificate && formData.qualificationCertificate instanceof File) {
                    try {
                        certificateBase64 = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = (err) => reject(err);
                            reader.readAsDataURL(formData.qualificationCertificate);
                        });
                    } catch (fileErr) {
                        console.error('File reading failed:', fileErr);
                        setError('Failed to process the certificate file. Please try again.');
                        return;
                    }
                }

                addNurse({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    department: formData.department,
                    password: formData.password,
                    qualification: formData.qualification,
                    knmcRegistrationNumber: formData.knmcRegistrationNumber,
                    qualificationCertificate: certificateBase64
                });
            } else {
                addPatient({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    age: parseInt(formData.age),
                    gender: formData.gender,
                    consultationReason: formData.consultationReason,
                    password: formData.password,
                    isFirstLogin: false
                });
            }
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError('Registration failed. Please try again.');
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center animate-fade-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Registration Sent!</h2>
                    <p className="text-slate-600 mb-8">
                        Your account has been created and is now **pending approval**.
                        An administrator or doctor will review your request shortly.
                    </p>
                    <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 text-teal-700 text-sm font-medium">
                        Redirecting to login...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-start md:items-center justify-center p-4 md:p-8 py-8 md:py-12 relative">
            <Link
                to="/"
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition-all duration-200 group z-50 shadow-sm hover:shadow-md"
            >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Home</span>
            </Link>
            <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
                {/* Left Side - Info */}
                <div className="md:w-5/12 bg-slate-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <Link to="/" className="flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">{systemName}</span>
                        </Link>

                        <h2 className="text-4xl font-bold mb-6 leading-tight">Join our <br />care network.</h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            Register today to start your journey towards better health monitoring and coordination.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-teal-500/20 group-hover:border-teal-500/30 transition-all">
                                    <Shield className="w-5 h-5 text-teal-400" />
                                </div>
                                <p className="text-sm font-medium text-slate-300">Secure & Confidential</p>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-teal-500/20 group-hover:border-teal-500/30 transition-all">
                                    <Activity className="w-5 h-5 text-teal-400" />
                                </div>
                                <p className="text-sm font-medium text-slate-300">Real-time Monitoring</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-12 pt-12 border-t border-white/10 text-slate-500 text-xs">
                        © 2026 {systemName} Health Systems.
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="md:w-7/12 p-6 md:p-12 relative">
                    <div className="mb-10 text-center md:text-left">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h3>
                        <p className="text-slate-500">
                            {(role === 'nurse' || role === 'doctor') && step === 2 
                                ? 'Verify your professional credentials.' 
                                : 'Please select your role and fill in the details.'}
                        </p>
                    </div>

                    <form onSubmit={(role === 'nurse' || role === 'doctor') && step === 1 ? handleNextStep : handleSubmit} className="space-y-6">
                        {/* Role Selection - Hide during Professional Verification */}
                        {!((role === 'nurse' || role === 'doctor') && step === 2) && (
                            <div className="grid grid-cols-3 gap-3">
                                {['patient', 'doctor', 'nurse'].map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => {
                                            setRole(r);
                                            setStep(1);
                                        }}
                                        className={`py-3 rounded-2xl text-sm font-bold capitalize transition-all border ${role === r
                                            ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/20'
                                            : 'bg-white border-slate-200 text-slate-500 hover:border-teal-200 hover:bg-teal-50'
                                            }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium animate-pulse">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Step 1 Fields */}
                            {!((role === 'nurse' || role === 'doctor') && step === 2) && (
                                <>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Full Name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email Address"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="Phone Number"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                        />
                                    </div>

                                    {/* Role Specific Fields */}
                                    {(role === 'doctor' || role === 'nurse') && (
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <select
                                                name="department"
                                                required
                                                value={formData.department}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium appearance-none"
                                            >
                                                <option value="" disabled>Select Department</option>
                                                <option value="Cardiology">Cardiology</option>
                                                <option value="Orthopedics">Orthopedics</option>
                                                <option value="Neurology">Neurology</option>
                                                <option value="Pediatrics">Pediatrics</option>
                                                <option value="General Medicine">General Medicine</option>
                                                <option value="ICU">ICU</option>
                                                <option value="Emergency">Emergency</option>
                                            </select>
                                        </div>
                                    )}

                                    {role === 'patient' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                        <PlusCircle className="w-5 h-5" />
                                                    </div>
                                                    <input
                                                        type="number"
                                                        name="age"
                                                        placeholder="Age"
                                                        required
                                                        value={formData.age}
                                                        onChange={handleChange}
                                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                                    />
                                                </div>
                                                <select
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium appearance-none"
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 pt-4 flex items-start pointer-events-none text-slate-400">
                                                    <Activity className="w-5 h-5" />
                                                </div>
                                                <textarea
                                                    name="consultationReason"
                                                    placeholder="Primary Medical Condition / Reason for Consultation"
                                                    required
                                                    rows="3"
                                                    value={formData.consultationReason}
                                                    onChange={handleChange}
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium resize-none text-sm"
                                                ></textarea>
                                            </div>
                                        </>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="password"
                                                name="password"
                                                placeholder="Password"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                placeholder="Confirm"
                                                required
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 2 Fields (Professional Verification) */}
                            {(role === 'nurse' || role === 'doctor') && step === 2 && (
                                <div className="space-y-6 animate-fade-left">
                                    <div className="relative">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Qualification</label>
                                        <select
                                            name="qualification"
                                            required
                                            value={formData.qualification}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium appearance-none"
                                        >
                                            <option value="" disabled>Select Qualification</option>
                                            {role === 'nurse' ? (
                                                <>
                                                    <option value="GNM Nursing">GNM Nursing</option>
                                                    <option value="BSc Nursing">BSc Nursing</option>
                                                    <option value="Post Basic BSc Nursing">Post Basic BSc Nursing</option>
                                                    <option value="MSc Nursing">MSc Nursing</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="MBBS">MBBS</option>
                                                    <option value="MD (Doctor of Medicine)">MD (Doctor of Medicine)</option>
                                                    <option value="MS (Master of Surgery)">MS (Master of Surgery)</option>
                                                    <option value="DNB">DNB</option>
                                                    <option value="PhD">PhD</option>
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                            {role === 'nurse' ? 'Kerala Nursing Council Registration Number' : 'Medical council registration number'}
                                        </label>
                                        <input
                                            type="text"
                                            name={role === 'nurse' ? 'knmcRegistrationNumber' : 'medicalRegistrationNumber'}
                                            placeholder={role === 'nurse' ? 'Enter KNMC Reg Number' : 'Enter Registration Number'}
                                            required
                                            value={role === 'nurse' ? formData.knmcRegistrationNumber : formData.medicalRegistrationNumber}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="relative">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Upload Qualification Certificate (PDF)</label>
                                        <input
                                            type="file"
                                            name="qualificationCertificate"
                                            accept=".pdf"
                                            required
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                        />
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center gap-1 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Step 1
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 mt-4"
                        >
                            {(role === 'nurse' || role === 'doctor') && step === 1 ? (
                                <>
                                    Register Now
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            ) : (
                                <>
                                    Complete Registration
                                    <CheckCircle className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <p className="text-center text-slate-500 text-sm">
                            Already have an account? {' '}
                            <Link to="/login" className="text-teal-600 font-bold hover:text-teal-700 transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
