import { useState, useEffect } from 'react';
import { supabase, type Lead, STATUS_LABELS, STATUS_DOT_COLORS, STATUS_COLORS, type LeadStatus } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import {
  Users, UserPlus, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Clock, Eye
} from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: { value: number; up: boolean };
  color: string;
}

function StatCard({ label, value, icon, trend, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.up ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trend.value}% from last week
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBreakdown({ leads, onStatusClick }: { leads: Lead[]; onStatusClick: (status: LeadStatus | 'all') => void }) {
  const total = leads.length;
  const statuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Pipeline Breakdown</h3>
      <div className="space-y-3">
        {statuses.map(status => {
          const count = leads.filter(l => l.status === status).length;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <button key={status} onClick={() => onStatusClick(status)} className="w-full text-left group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{STATUS_LABELS[status]}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{count}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${STATUS_DOT_COLORS[status]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RecentLeads({ leads, onSelectLead }: { leads: Lead[]; onSelectLead: (id: string) => void }) {
  const recent = [...leads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Recent Leads</h3>
        <Clock className="w-4 h-4 text-slate-400" />
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No leads yet</p>
      ) : (
        <div className="space-y-3">
          {recent.map(lead => (
            <button
              key={lead.id}
              onClick={() => onSelectLead(lead.id)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                  {lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{lead.name}</p>
                  <p className="text-xs text-slate-400 truncate">{lead.company || lead.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_COLORS[lead.status]}`}>
                  {STATUS_LABELS[lead.status]}
                </span>
                <Eye className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ onNavigate }: { onNavigate: (page: string, data?: Record<string, string>) => void }) {
  const { user, signOut } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (data) setLeads(data as Lead[]);
      setLoading(false);
    };
    fetchLeads();
  }, []);

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const converted = leads.filter(l => l.status === 'converted').length;
  const totalValue = leads.reduce((sum, l) => sum + Number(l.estimated_value), 0);
  const convRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : '0';

  const handleStatusClick = (status: LeadStatus | 'all') => {
    onNavigate('leads', status === 'all' ? {} : { status });
  };

  if (loading) {
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
              <button onClick={() => onNavigate('dashboard')} className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">Dashboard</button>
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
        <button onClick={() => onNavigate('dashboard')} className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg">Dashboard</button>
        <button onClick={() => onNavigate('leads')} className="flex-1 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Leads</button>
        <button onClick={() => onNavigate('contact')} className="flex-1 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Form</button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of your lead pipeline</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Leads" value={totalLeads} icon={<Users className="w-5 h-5 text-blue-600" />} color="bg-blue-50" trend={{ value: 12, up: true }} />
          <StatCard label="New Leads" value={newLeads} icon={<UserPlus className="w-5 h-5 text-amber-600" />} color="bg-amber-50" trend={{ value: 8, up: true }} />
          <StatCard label="Conversion Rate" value={`${convRate}%`} icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} color="bg-emerald-50" trend={{ value: 3, up: true }} />
          <StatCard label="Pipeline Value" value={`$${totalValue.toLocaleString()}`} icon={<DollarSign className="w-5 h-5 text-green-600" />} color="bg-green-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusBreakdown leads={leads} onStatusClick={handleStatusClick} />
          <RecentLeads leads={leads} onSelectLead={(id) => onNavigate('lead-detail', { id })} />
        </div>
      </main>
    </div>
  );
}
