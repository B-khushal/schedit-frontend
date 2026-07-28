import React, { useState } from 'react';
import { Mail, MapPin, MessageSquare, Phone, Clock, CheckCircle2, Send, Sparkles } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companySize: '1-10 Employees',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const { warning, success } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) {
      warning('Required Fields', 'Please fill in your email address and message.');
      return;
    }
    setSubmitted(true);
    success('Message Sent!', 'Thank you for reaching out. Our support team will get back to you within 2 hours.');
  };

  return (
    <div className="w-full py-16 px-6 max-w-[1300px] mx-auto text-left font-sans select-none space-y-16">
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-200">
          Support & Sales
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 font-display tracking-tight leading-tight">
          Get in Touch With Our Team.
        </h1>
        <p className="text-lg text-gray-600 font-medium">
          Have a question about SCHEDIT features, enterprise setup, or custom plans? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-card">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 font-display">Message Successfully Received</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Thank you for contacting SCHEDIT. A dedicated product specialist has been assigned to your message and will respond within 2 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-brand-500 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 font-display">Send Us a Direct Message</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">First Name</label>
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Jane"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Last Name</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Work Email Address *</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@agency.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Company Size</label>
                  <select
                    value={formData.companySize}
                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  >
                    <option>1-10 Employees</option>
                    <option>11-50 Employees</option>
                    <option>51-200 Employees</option>
                    <option>201+ Enterprise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Subject</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Inquiry about Meta Reels Publishing"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">How can we help? *</label>
                <textarea 
                  rows={5} 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your project or questions..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Direct Inquiry</span>
              </button>
            </form>
          )}
        </div>

        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-900 text-white p-8 rounded-3xl border border-gray-800 shadow-xl space-y-6">
            <h3 className="text-xl font-bold font-display text-white">Direct Contacts & Response SLAs</h3>

            <div className="space-y-5">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Technical Support</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Average response time: &lt; 2 hours</p>
                  <a href="mailto:support@schedit.in" className="text-xs font-bold text-brand-400 hover:underline mt-1 block">
                    support@schedit.in
                  </a>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Support Hours</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Monday to Saturday: 9:00 AM – 9:00 PM IST</p>
                  <p className="text-[10px] text-emerald-400 font-bold mt-1">24/7 Automated System Monitoring Active</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">SCHEDIT Headquarters</h4>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    SCHEDIT Technologies Private Limited<br />
                    Cyber City Tech Park, Phase II<br />
                    Bengaluru, Karnataka 560100
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
