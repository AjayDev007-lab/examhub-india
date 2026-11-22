import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from "lucide-react";

export default function StudentProfile({ onNavigate }) {
  const { currentUser, studentProfile, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form states initialized with current student profile
  const [fullName, setFullName] = useState(studentProfile?.fullName || "");
  const [phone, setPhone] = useState(studentProfile?.phone || "");
  const [dob, setDob] = useState(studentProfile?.dob || "");
  const [gender, setGender] = useState(studentProfile?.gender || "Male");
  const [state, setState] = useState(studentProfile?.state || "Maharashtra");
  const [district, setDistrict] = useState(studentProfile?.district || "");
  const [college, setCollege] = useState(studentProfile?.college || "");
  const [course, setCourse] = useState(studentProfile?.course || "");

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim()) return setErrorMsg("Full legal name cannot be empty.");
    if (!phone.trim()) return setErrorMsg("Phone number cannot be empty.");

    setLoading(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        dob,
        gender,
        state,
        district: district.trim(),
        college: college.trim(),
        course: course.trim()
      });
      setIsEditing(false);
      setSuccessMsg("Student profile and Firestore records updated successfully!");
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile records.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cyan-500/20 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-cyber">
            National Scholar Credentials
          </span>
          <h1 className="text-3xl font-black text-white font-cyber">
            Student Profile Details
          </h1>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center space-x-1.5 shadow-glow-cyan transition-all self-start sm:self-auto"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile Details</span>
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <X className="w-4 h-4" />
            <span>Cancel Editing</span>
          </button>
        )}
      </div>

      {/* Status Alerts */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-10 border border-cyan-500/30">
        
        {/* Profile Card Header with Avatar */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-8 border-b border-slate-800">
          <img
            src={studentProfile?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email}`}
            alt="Profile Avatar"
            className="w-24 h-24 rounded-2xl object-cover border-2 border-cyan-400 shadow-glow-cyan"
          />
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-black text-white font-cyber">
              {studentProfile?.fullName || currentUser?.displayName || "Aditya Sharma"}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                {studentProfile?.studentId || "EH-2026-90412"}
              </span>
              <span className="text-slate-400">• {currentUser?.email}</span>
            </div>
            <p className="text-xs text-slate-300 font-semibold pt-0.5">
              {studentProfile?.course || "B.Tech Computer Science & AI"} • {studentProfile?.college || "Autonomous College"}
            </p>
          </div>
        </div>

        {/* Profile Attributes (View vs Edit Form) */}
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 text-xs">
            
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-midnight-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">1. Full Legal Name</span>
                <span className="text-sm font-bold text-white">{studentProfile?.fullName || "—"}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-midnight-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">2. Student ID Number</span>
                <span className="text-sm font-mono font-bold text-cyan-400">{studentProfile?.studentId || "—"}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-midnight-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">3. Registered Email Address</span>
                <span className="text-sm font-bold text-slate-200">{currentUser?.email || studentProfile?.email || "—"}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-midnight-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">4. Phone Number</span>
                <span className="text-sm font-bold text-slate-200">{studentProfile?.phone || "—"}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-midnight-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">5. Date of Birth</span>
                <span className="text-sm font-bold text-slate-200">{studentProfile?.dob || "—"}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-midnight-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">6. Gender</span>
                <span className="text-sm font-bold text-slate-200">{studentProfile?.gender || "Male"}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-midnight-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">7. State of Domicile</span>
                <span className="text-sm font-bold text-white">{studentProfile?.state || "—"}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-midnight-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">8. District / City</span>
                <span className="text-sm font-bold text-slate-200">{studentProfile?.district || "—"}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-midnight-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">9. College / School</span>
                <span className="text-sm font-bold text-slate-200">{studentProfile?.college || "—"}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-midnight-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">10. Degree / Program / Course</span>
                <span className="text-sm font-bold text-slate-200">{studentProfile?.course || "—"}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-midnight-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Accreditation Status</span>
                <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs mt-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Aadhaar & Academic Records Verified</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Editable Form */
          <form onSubmit={handleSave} className="space-y-4 pt-8 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">State of Domicile *</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">District / City *</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">College / School Name *</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Degree / Course *</label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black shadow-glow-cyan flex items-center space-x-1.5"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save to Firestore</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
