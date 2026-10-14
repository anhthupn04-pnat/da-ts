import React from 'react';
import { Lead } from '@/types';
import { Users, PhoneForwarded, MessageSquareText, FileCheck, CheckCircle } from 'lucide-react';

interface ConversionFunnelProps {
  leads: Lead[];
}

export default function ConversionFunnel({ leads }: ConversionFunnelProps) {
  const total = leads.length || 1;

  const countNew = leads.length;
  const countContacted = leads.filter(l => l.status !== 'new' && l.status !== 'cancelled').length;
  const countConsulting = leads.filter(l => ['consulting', 'registered', 'enrolled'].includes(l.status)).length;
  const countRegistered = leads.filter(l => ['registered', 'enrolled'].includes(l.status)).length;
  const countEnrolled = leads.filter(l => l.status === 'enrolled').length;

  const steps = [
    {
      title: 'Tiếp nhận Mới',
      count: countNew,
      percent: Math.round((countNew / total) * 100),
      color: 'bg-blue-600',
      icon: Users
    },
    {
      title: 'Đã Liên Hệ / Kết Nối',
      count: countContacted,
      percent: Math.round((countContacted / total) * 100),
      color: 'bg-indigo-600',
      icon: PhoneForwarded
    },
    {
      title: 'Đang Tư Vấn Chuyên Sâu',
      count: countConsulting,
      percent: Math.round((countConsulting / total) * 100),
      color: 'bg-violet-600',
      icon: MessageSquareText
    },
    {
      title: 'Đã Nộp Hồ Sơ / Đăng Ký',
      count: countRegistered,
      percent: Math.round((countRegistered / total) * 100),
      color: 'bg-amber-500',
      icon: FileCheck
    },
    {
      title: 'Nhập Học Chính Thức (K32)',
      count: countEnrolled,
      percent: Math.round((countEnrolled / total) * 100),
      color: 'bg-emerald-600',
      icon: CheckCircle
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Phễu Chuyển Đổi Tuyển Sinh K32
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tỷ lệ chuyển đổi qua các giai đoạn từ tiếp nhận đến nhập học
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
          Tổng hồ sơ: {leads.length}
        </span>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-600 font-bold">
                    {idx + 1}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{step.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900">{step.count} thí sinh</span>
                  <span className="text-slate-400">({step.percent}%)</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full ${step.color} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${Math.max(step.percent, 3)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
