import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight,
  Eye,
  EyeOff
} from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi (NCT)", "Jammu & Kashmir"
];

export default function Register({ onNavigate }) {
  const { registerStudent } = useAuth();

  // 12 Required Fields
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [state, setState] = useState("Maharashtra");
  const [district, setDistrict] = useState("");
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Statuses
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: "", color: "bg-slate-700" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 1: return { score: 1, text: "Weak", color: "bg-red-500", textCol: "text-red-400" };
      case 2: return { score: 2, text: "Fair", color: "bg-amber-500", textCol: "text-amber-400" };
      case 3: return { score: 3, text: "Good", color: "bg-cyan-400", textCol: "text-cyan-400" };
      case 4: return { score: 4, text: "Strong (Cyber Shield)", color: "bg-emerald-400", textCol: "text-emerald-400" };
      default: return { score: 0, text: "", color: "bg-slate-700", textCol: "text-slate-400" };
    }
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Strict Validations
    if (!fullName.trim()) return setErrorMsg("Full legal name is required.");
    if (!email.trim() || !email.includes("@")) return setErrorMsg("Valid email address is required.");
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) return setErrorMsg("Valid 10-digit mobile number is required.");
    if (!dob) return setErrorMsg("Date of birth is required.");
    if (!district.trim()) return setErrorMsg("District is required.");
    if (!college.trim()) return setErrorMsg("College / School name is required.");
    if (!course.trim()) return setErrorMsg("Course / Program name is required.");
    if (password.length < 8) return setErrorMsg("Password must be at least 8 characters long.");
    if (password !== confirmPassword) return setErrorMsg("Password and Confirm Password do not match.");
    if (!termsAccepted) return setErrorMsg("You must accept the terms of national examination services.");

    setLoading(true);
    try {
      const generatedId = studentId.trim() || `EH-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      await registerStudent({
        fullName,
        studentId: generatedId,
        email,
        phone,
        dob,
        gender,
        state,
        district,
        college,
        course,
        password
      });

      setSuccessMsg("Account created and verified! Redirecting to your Student Dashboard...");
      setTimeout(() => {
        onNavigate("student-dashboard");
      }, 900);
    } catch (err) {
      setErrorMsg(err.message || "Failed to complete registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto glass-panel-glow rounded-3xl p-8 sm:p-12 border border-cyan-500/30 relative">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center mx-auto text-black shadow-glow-cyan">
            <GraduationCap className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-3xl font-black text-white font-cyber tracking-wide">
            Student Examination Registration
          </h2>
          <p className="text-xs text-slate-400">
            Create your unified student accreditation profile across all Indian competitive testing bodies
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 12 Fields Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Personal Identification */}
          <div className="space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-cyber flex items-center space-x-1.5 border-b border-slate-800 pb-1">
              <User className="w-3.5 h-3.5" />
              <span>1. Personal & Identity Verification</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  1. Full Legal Name (As per 10th Marks Card) *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aditya Sharma"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  2. Student ID (Optional or Auto-Assigned)
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. EH-2026-90412"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  3. Official Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@examhub.in"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  4. Phone / Mobile Number (SMS Alerts) *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  5. Date of Birth *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  6. Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Residential & Academic Details */}
          <div className="space-y-4 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-cyber flex items-center space-x-1.5 border-b border-slate-800 pb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>2. Residential Jurisdiction & Academic Institution</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  7. State of Domicile *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  8. District / City *
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Pune / Bengaluru"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  9. College / School Name *
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Fergusson College, Pune"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  10. Degree / Course / Stream *
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science / Class 12 Science"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Security & Credentials */}
          <div className="space-y-4 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-cyber flex items-center space-x-1.5 border-b border-slate-800 pb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>3. Account Security Credentials</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  11. Create Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  12. Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Strength Meter */}
            {password && (
              <div className="p-3 rounded-xl bg-midnight-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Password Security Strength:</span>
                  <span className={`font-bold ${strength.textCol}`}>{strength.text}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="pt-2">
            <label className="flex items-start space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>
                I hereby declare that the details furnished above are accurate as per my official educational marks documents and I agree to the <span className="text-cyan-400">ExamHub India National Terms</span>.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-blue-400 text-black font-black text-sm shadow-glow-cyan flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creating Student Account in Firestore...</span>
              </>
            ) : (
              <>
                <span>Complete Student Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Existing User Redirect */}
        <div className="text-center pt-6 mt-6 border-t border-slate-800 text-xs text-slate-400">
          <span>Already registered with ExamHub India? </span>
          <button
            onClick={() => onNavigate("login")}
            className="text-cyan-400 hover:text-cyan-300 font-bold ml-1"
          >
            Sign In Here
          </button>
        </div>

      </div>
    </div>
  );
}
