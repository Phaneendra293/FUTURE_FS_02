import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import {
  TrendingUp, Send, CheckCircle2, Loader2, User, Mail, Phone, Building2, MessageSquare
} from 'lucide-react';

export default function ContactForm({ onNavigate }: {
  onNavigate: (page: string, data?: Record<string, string>) => void;
}) {
  const { user, signOut } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error } = await supabase.from('leads').insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      company: form.company || null,
      message: form.message || null,
      source: 'website',
      status: 'new',
    });

    if (error) {
      setError('Something went wrong. Please try again.');
    } else {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
          <p className="text-slate-400 mb-8">We'll get back to you shortly.</p>
          {user && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-2.5 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors border border-white/10"
            >
              Back to Dashboard
            </button>
          )}
          <button
            onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', company: '', message: '' }); }}
            className="block mx-auto mt-3 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Submit another inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {user && (
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white text-sm">LeadFlow</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onNavigate('dashboard')} className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">Dashboard</button>
                <button onClick={signOut} className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">Sign Out</button>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className="flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 mb-4 shadow-lg shadow-blue-500/25">
              <Send className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Get in Touch</h1>
            <p className="text-slate-400 mt-1 text-sm">We'd love to hear from you</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-1.5">
                  <User className="w-3.5 h-3.5" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="John Smith"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => updateField('email', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => updateField('phone', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Company
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => updateField('company', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Message
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={e => updateField('message', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                  placeholder="Tell us about your project..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium hover:from-blue-500 hover:to-cyan-400 transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
