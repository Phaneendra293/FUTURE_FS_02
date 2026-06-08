import { useState, useEffect } from 'react';
import { supabase, type Lead, type LeadStatus, type FollowUp, STATUS_LABELS, STATUS_COLORS, STATUS_DOT_COLORS } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import {
  TrendingUp, ArrowLeft, Mail, Phone, Building2, Globe, DollarSign,
  MessageSquare, Send, Clock, Loader2, ChevronDown
} from 'lucide-react';

export default function LeadDetail({ leadId, onNavigate }: {
  leadId: string;
  onNavigate: (page: string, data?: Record<string, string>) => void;
}) {
  const { user, signOut } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [newNote, setNewNote] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingNote, setSendingNote] = useState(false);
  const [editValue, setEditValue] = useState(false);
  const [valueInput, setValueInput] = useState('');

  useEffect(() => {
    const fetchLead = async () => {
      const { data } = await supabase.from('leads').select('*').eq('id', leadId).single();
      if (data) {
        setLead(data as Lead);
        setValueInput(String(data.estimated_value));
      }
    };
    const fetchFollowUps = async () => {
      const { data } = await supabase.from('follow_ups').select('*').eq('lead_id', leadId).order('created_at', { ascending: false });
      if (data) setFollowUps(data as FollowUp[]);
    };
    fetchLead();
    fetchFollowUps();
  }, [leadId]);

  const updateStatus = async (status: LeadStatus) => {
    if (!lead) return;
    setSaving(true);
    const { data } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', lead.id)
      .select()
      .single();
    if (data) setLead(data as Lead);
    setStatusOpen(false);
    setSaving(false);
  };

  const updateValue = async () => {
    if (!lead) return;
    const val = parseFloat(valueInput) || 0;
    setSaving(true);
    const { data } = await supabase
      .from('leads')
      .update({ estimated_value: val, updated_at: new Date().toISOString() })
      .eq('id', lead.id)
      .select()
      .single();
    if (data) setLead(data as Lead);
    setEditValue(false);
    setSaving(false);
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    setSendingNote(true);
    const { data } = await supabase
      .from('follow_ups')
      .insert({ lead_id: leadId, note: newNote.trim() })
      .select()
      .single();
    if (data) {
      setFollowUps(prev => [data as FollowUp, ...prev]);
      setNewNote('');
    }
    setSendingNote(false);
  };

  const formatDateTime = (d: string) => {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  if (!lead) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">LeadFlow</span>
            </div>
            <nav className="hidden sm:flex items-center gap-1">
              <button onClick={() => onNavigate('dashboard')} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Dashboard</button>
              <button onClick={() => onNavigate('leads')} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Leads</button>
              <button onClick={() => onNavigate('contact')} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Contact Form</button>
            </nav>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-slate-500">{user?.email}</span>
              <button onClick={signOut} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">Sign Out</button>
            </div>
          </div>
        </div>
      </header>

      <div className="sm:hidden bg-white border-b border-slate-200 px-4 py-2 flex gap-1">
        <button onClick={() => onNavigate('dashboard')} className="flex-1 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Dashboard</button>
        <button onClick={() => onNavigate('leads')} className="flex-1 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Leads</button>
        <button onClick={() => onNavigate('contact')} className="flex-1 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Form</button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('leads')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leads
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-xl font-bold text-slate-600">
                    {lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">{lead.name}</h1>
                    {lead.company && <p className="text-sm text-slate-500">{lead.company}</p>}
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setStatusOpen(!statusOpen)}
                    disabled={saving}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${STATUS_COLORS[lead.status]} hover:shadow-sm disabled:opacity-60`}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[lead.status]}`} />}
                    {STATUS_LABELS[lead.status]}
                    <ChevronDown className={`w-4 h-4 transition-transform ${statusOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {statusOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-10">
                      {(['new', 'contacted', 'qualified', 'converted', 'lost'] as LeadStatus[]).map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(s)}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${lead.status === s ? 'font-semibold' : ''}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[s]}`} />
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${lead.email}`} className="text-sm text-blue-600 hover:underline">{lead.email}</a>
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <a href={`tel:${lead.phone}`} className="text-sm text-slate-700">{lead.phone}</a>
                  </div>
                )}
                {lead.company && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">{lead.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-700 capitalize">{lead.source}</span>
                </div>
              </div>

              {lead.message && (
                <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Original Message</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{lead.message}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Follow-up Notes ({followUps.length})
              </h2>

              <div className="flex gap-2 mb-6">
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Add a follow-up note..."
                  rows={2}
                  className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                />
                <button
                  onClick={addNote}
                  disabled={!newNote.trim() || sendingNote}
                  className="self-end px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                >
                  {sendingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>

              {followUps.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No follow-up notes yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {followUps.map(fu => (
                    <div key={fu.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 leading-relaxed">{fu.note}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatDateTime(fu.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Deal Value</h3>
              {editValue ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg text-slate-500">$</span>
                  <input
                    type="number"
                    value={valueInput}
                    onChange={e => setValueInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                  <button onClick={updateValue} className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Save</button>
                  <button onClick={() => { setEditValue(false); setValueInput(String(lead.estimated_value)); }} className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                </div>
              ) : (
                <div onClick={() => setEditValue(true)} className="flex items-center gap-2 cursor-pointer group">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold text-slate-900">${Number(lead.estimated_value).toLocaleString()}</span>
                  <span className="text-xs text-slate-400 group-hover:text-blue-600 transition-colors">edit</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700">Lead created</p>
                    <p className="text-xs text-slate-400">{formatDateTime(lead.created_at)}</p>
                  </div>
                </div>
                {lead.updated_at !== lead.created_at && (
                  <div className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[lead.status]} mt-1.5 shrink-0`} />
                    <div>
                      <p className="text-sm text-slate-700">Status updated to {STATUS_LABELS[lead.status]}</p>
                      <p className="text-xs text-slate-400">{formatDateTime(lead.updated_at)}</p>
                    </div>
                  </div>
                )}
                {followUps.slice(0, 3).map(fu => (
                  <div key={fu.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700">Follow-up added</p>
                      <p className="text-xs text-slate-400">{formatDateTime(fu.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
