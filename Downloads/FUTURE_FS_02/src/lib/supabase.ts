import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  source: string;
  message: string | null;
  status: LeadStatus;
  estimated_value: number;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  note: string;
  created_at: string;
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  converted: 'Converted',
  lost: 'Lost',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  contacted: 'bg-amber-100 text-amber-800 border-amber-200',
  qualified: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  converted: 'bg-green-100 text-green-800 border-green-200',
  lost: 'bg-red-100 text-red-800 border-red-200',
};

export const STATUS_DOT_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-amber-500',
  qualified: 'bg-emerald-500',
  converted: 'bg-green-500',
  lost: 'bg-red-500',
};
