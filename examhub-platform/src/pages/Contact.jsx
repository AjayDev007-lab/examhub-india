import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-cyber">
          Grievance Redressal & Help Desk
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-cyber">
          Contact ExamHub India
        </h1>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          Need assistance with your examination application, hall ticket retrieval, or scorecard verification? Reach out to our dedicated student helpline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Contact Info Cards */}
        <div className="md:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-3xl space-y-3">
            <h3 className="font-cyber font-bold text-base text-white uppercase">Official Help Desk</h3>
            
            <div className="flex items-start space-x-3 text-xs text-slate-300">
              <Phone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">National Toll-Free Helpline:</strong>
                <span>1800-11-2026 (09:00 AM – 06:00 PM IST)</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs text-slate-300">
              <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Grievance & Support Email:</strong>
                <span>support@examhub.in</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Central Operations Hub:</strong>
                <span>Institutional Testing Complex, New Delhi — 110001, India</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-cyan-500/20 text-xs text-slate-300 space-y-2">
            <span className="font-bold text-cyan-400 uppercase tracking-wider block font-cyber">
              Grievance Timelines
            </span>
            <p>
              In accordance with National Academic Transparency standards, all student identity inquiries, admit card corrections, and result verifications are resolved within 24 to 48 business hours.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 glass-panel-glow p-6 sm:p-8 rounded-3xl border border-cyan-500/30">
          <h3 className="font-cyber font-bold text-lg text-white mb-4">
            Send an Official Support Inquiry
          </h3>

          {submitted && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Thank you! Your grievance inquiry ticket has been logged with Priority: High.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Your Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aditya Sharma"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Registered Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@examhub.in"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1">Subject / Examination Name</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. NEET UG 2026 Hall Ticket Discrepancy"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1">Detailed Message *</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your inquiry or question..."
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                required
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black shadow-glow-cyan flex items-center space-x-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Support Ticket</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
