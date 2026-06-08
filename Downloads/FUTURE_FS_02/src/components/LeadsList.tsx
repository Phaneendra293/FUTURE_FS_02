import { useState, useEffect } from 'react';
import { supabase, type Lead, type LeadStatus, STATUS_LABELS, STATUS_COLORS, STATUS_DOT_COLORS } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Search, Filter, TrendingUp, ChevronDown, Eye, Trash2, X } from 'lucide-react';

export default function LeadsList({ onNavigate, initialStatus }: {
  onNavigate: (page: string, data?: Record<string, string>) => void;
  initialStatus?: string;
}) {
  const { user, signOut } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>(
    (initialStatus as LeadStatus) || 'all'
  );
  const [showFilters, setShowFilters] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (data) setLeads(data as Lead[]);
      setLoading(false);
    };
    fetchLeads();
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from('follow_ups').delete().eq('lead_id', id);
    await supabase.from('leads').delete().eq('id', id);
    setLeads(prev => prev.filter(l => l.id !== id));
    setDeleteId(null);
  };

  const filtered = leads.filter(lead => {
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSearch = search === '' ||
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      (lead.company?.toLowerCase() ?? '').includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
              <button onClick={() => onNavigate('leads')} className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">Leads</button>
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
        <button onClick={() => onNavigate('leads')} className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg">Leads</button>
        <button onClick={() => onNavigate('contact')} className="flex-1 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Form</button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
            <p className="text-sm text-slate-500 mt-1">{filtered.length} lead{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search leads..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${showFilters ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Filter by status</span>
              {statusFilter !== 'all' && (
                <button onClick={() => setStatusFilter('all')} className="text-xs text-blue-600 hover:text-blue-700">Clear</button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${statusFilter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                All
              </button>
              {(['new', 'contacted', 'qualified', 'converted', 'lost'] as LeadStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${statusFilter === s ? `${STATUS_COLORS[s]} border-current` : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_COLORS[s]}`} />
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No leads found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                            {lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{lead.name}</p>
                            <p className="text-xs text-slate-400">{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[lead.status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_COLORS[lead.status]}`} />
                          {STATUS_LABELS[lead.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">${Number(lead.estimated_value).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 capitalize">{lead.source}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(lead.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => onNavigate('lead-detail', { id: lead.id })} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          {deleteId === lead.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(lead.id)} className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors">Confirm</button>
                              <button onClick={() => setDeleteId(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteId(lead.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-3">
              {filtered.map(lead => (
                <button
                  key={lead.id}
                  onClick={() => onNavigate('lead-detail', { id: lead.id })}
                  className="w-full bg-white rounded-xl border border-slate-200 p-4 text-left hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
                        {lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{lead.name}</p>
                        <p className="text-xs text-slate-400">{lead.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_COLORS[lead.status]}`}>
                      {STATUS_LABELS[lead.status]}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <span>${Number(lead.estimated_value).toLocaleString()}</span>
                    <span className="capitalize">{lead.source}</span>
                    <span>{formatDate(lead.created_at)}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </main>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900">Delete Lead?</h3>
            <p className="text-sm text-slate-500 mt-2">This action cannot be undone. All follow-up notes will also be deleted.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
