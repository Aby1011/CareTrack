import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { prescriptionAPI, users } from '../data/mockData';
import { CheckCircle, AlertTriangle, Shield, Calendar, ArrowLeft } from 'lucide-react';

function VerifyPrescription() {
  const { id } = useParams();
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a network delay for the verification process
    setTimeout(() => {
      const result = prescriptionAPI.verify(id);
      
      if (result.valid) {
        // Hydrate doctor and patient names
        const doctor = users.doctors.find(d => String(d.id) === String(result.data.doctorId));
        const patient = users.patients.find(p => String(p.id) === String(result.data.patientId));
        
        setVerificationResult({
          ...result,
          doctorName: doctor ? doctor.name : 'Unknown Doctor',
          patientName: patient ? patient.name : 'Unknown Patient'
        });
      } else {
        setVerificationResult(result);
      }
      setLoading(false);
    }, 1500);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold text-slate-800">Verifying Digital Signature...</h2>
        <p className="text-slate-500 mt-2">Checking cryptographic hash against records.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-lg">
        
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to CareTrack
          </Link>
        </div>

        {verificationResult?.valid ? (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-green-100 relative overflow-hidden animate-fade-up">
            <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
            
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Verified Prescription</h1>
              <p className="text-green-600 font-medium flex items-center justify-center gap-1 mt-2">
                <Shield className="w-4 h-4" />
                Valid Digital Signature
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Prescription Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400">Medicine</p>
                    <p className="font-bold text-slate-800 text-lg">{verificationResult.data.medicineName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Dosage</p>
                      <p className="font-medium text-slate-800">{verificationResult.data.dosage}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Duration</p>
                      <p className="font-medium text-slate-800">{verificationResult.data.duration}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Instructions</p>
                    <p className="font-medium text-slate-800">{verificationResult.data.instructions}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">Prescribed By</p>
                  <p className="font-bold text-slate-800">{verificationResult.doctorName}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">Patient</p>
                  <p className="font-bold text-slate-800">{verificationResult.patientName}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(verificationResult.data.createdAt).toLocaleDateString()}
                </div>
                <div className="uppercase text-[10px] tracking-wider font-mono">
                  ID: {verificationResult.data.id}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-red-100 relative overflow-hidden animate-fade-up">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Invalid Prescription</h1>
              <p className="text-red-600 font-medium mt-2">{verificationResult?.message || "Tampered or forged prescription detected."}</p>
              
              <div className="mt-8 p-4 bg-slate-50 rounded-xl w-full text-left text-sm text-slate-600">
                <p>The cryptographic signature of this prescription could not be verified. Do not fulfill this prescription as it may have been modified or is entirely fraudulent.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyPrescription;
