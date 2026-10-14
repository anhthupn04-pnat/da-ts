import React from 'react';
import { Lead, LeadSource } from '@/types';
import { Globe, Share2, Video, Calendar, UserPlus, PhoneCall, HelpCircle } from 'lucide-react';

interface LeadSourceChartProps {
  leads: Lead[];
}

export default function LeadSourceChart({ leads }: LeadSourceChartProps) {
  const sourcesConfig: { key: LeadSource; label: string; color: string; bg: string; icon: React.ReactNode }[] = [
    { key: 'website', label: 'Cổng Website TTTV', color: '#2563EB', bg: 'bg-blue-600', icon: <Globe className="w-3.5 h-3.5" /> },
    { key: 'facebook', label: 'Fanpage & Facebook Ads', color: '#4F46E5', bg: 'bg-indigo-600', icon: <Share2 className="w-3.5 h-3.5" /> },
    { key: 'tiktok', label: 'Kênh TikTok VN-US', color: '#9333EA', bg: 'bg-purple-600', icon: <Video className="w-3.5 h-3.5" /> },
    { key: 'event', label: 'Ngày hội Tuyển sinh / THPT', color: '#D97706', bg: 'bg-amber-600', icon: <Calendar className="w-3.5 h-3.5" /> },
    { key: 'referral', label: 'Cựu SV / Giới thiệu', color: '#059669', bg: 'bg-emerald-600', icon: <UserPlus className="w-3.5 h-3.5" /> },
    { key: 'hotline', label: 'Cuộc gọi Hotline', color: '#DC2626', bg: 'bg-rose-600', icon: <PhoneCall className="w-3.5 h-3.5" /> },
    { key: 'other', label: 'Nguồn khác', color: '#64748B', bg: 'bg-slate-500', icon: <HelpCircle className="w-3.5 h-3.5" /> }
  ];

  const total = leads.length || 1;

  const data = sourcesConfig.map(s => {
    const count = leads.filter(l => l.source === s.key).length;
    const percent = Math.round((count / total) * 100);
    return { ...s, count, percent };
  }).filter(d => d.count > 0 || ['website', 'facebook', 'tiktok', 'event', 'referral', 'hotline'].includes(d.key));

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Nguồn Tiếp Cận Thí Sinh
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kênh truyền thông & sự kiện đem lại hiệu quả cao nhất
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {data.map(item => (
          <div key={item.key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <span className="text-slate-500">{item.icon}</span>
                <span>{item.label}</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{item.count}</span>
                <span className="text-slate-400 font-mono text-[11px]">({item.percent}%)</span>
              </div>
            </div>
            
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.bg} rounded-full transition-all duration-500`}
                style={{ width: `${Math.max(item.percent, 4)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
