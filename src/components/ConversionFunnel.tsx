'use client';

import React from 'react';
import { Lead } from '@/types';
import {
  Users,
  PhoneOff,
  PhoneForwarded,
  Flame,
  FileClock,
  FileCheck,
  Award,
  CheckCircle2,
  CreditCard,
  XCircle
} from 'lucide-react';

interface ConversionFunnelProps {
  leads: Lead[];
}

export default function ConversionFunnel({ leads }: ConversionFunnelProps) {
  const total = leads.length || 1;

  // 10 giai đoạn
  const countNew = leads.filter(l => l.status === 'new').length;
  const countUnreachable = leads.filter(l => l.status === 'unreachable').length;
  const countConsulted1 = leads.filter(l => l.status === 'consulted_1').length;
  const countHot = leads.filter(l => l.status === 'hot_lead').length;
  const countWaitingTranscript = leads.filter(l => l.status === 'waiting_transcript').length;
  const countSubmitted = leads.filter(l => l.status === 'submitted_app').length;
  const countConditional = leads.filter(l => l.status === 'conditional_admit').length;
  const countConfirmed = leads.filter(l => l.status === 'confirmed_enroll').length;
  const countPaid = leads.filter(l => l.status === 'tuition_paid' || l.paymentStatus === 'tuition_paid').length;
  const countCancelled = leads.filter(l => l.status === 'cancelled').length;

  const funnelStages = [
    {
      title: '1. Mới tiếp nhận (Leads Thô)',
      count: countNew,
      percent: Math.round((countNew / total) * 100),
      color: 'bg-slate-500',
      icon: Users
    },
    {
      title: '2. Chưa liên hệ được',
      count: countUnreachable,
      percent: Math.round((countUnreachable / total) * 100),
      color: 'bg-amber-500',
      icon: PhoneOff
    },
    {
      title: '3. Đã tư vấn lần 1',
      count: countConsulted1,
      percent: Math.round((countConsulted1 / total) * 100),
      color: 'bg-blue-600',
      icon: PhoneForwarded
    },
    {
      title: '4. Quan tâm cao (Lead Nóng)',
      count: countHot,
      percent: Math.round((countHot / total) * 100),
      color: 'bg-orange-500',
      icon: Flame
    },
    {
      title: '5. Chờ học bạ THPT',
      count: countWaitingTranscript,
      percent: Math.round((countWaitingTranscript / total) * 100),
      color: 'bg-purple-600',
      icon: FileClock
    },
    {
      title: '6. Đã nộp hồ sơ xét tuyển',
      count: countSubmitted,
      percent: Math.round((countSubmitted / total) * 100),
      color: 'bg-indigo-600',
      icon: FileCheck
    },
    {
      title: '7. Trúng tuyển có điều kiện',
      count: countConditional,
      percent: Math.round((countConditional / total) * 100),
      color: 'bg-teal-600',
      icon: Award
    },
    {
      title: '8. Đã xác nhận nhập học',
      count: countConfirmed,
      percent: Math.round((countConfirmed / total) * 100),
      color: 'bg-cyan-600',
      icon: CheckCircle2
    },
    {
      title: '9. Đã đóng học phí / Nhập học',
      count: countPaid,
      percent: Math.round((countPaid / total) * 100),
      color: 'bg-emerald-600',
      icon: CreditCard
    },
    {
      title: '10. Từ chối / Hủy hồ sơ',
      count: countCancelled,
      percent: Math.round((countCancelled / total) * 100),
      color: 'bg-rose-500',
      icon: XCircle
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Phễu Chuyển Đổi Đường Ống Tuyển Sinh (10 Giai Đoạn)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Đo lường tỷ lệ thí sinh rơi rụng qua từng vòng để tối ưu hóa phương pháp tư vấn
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
          Tổng hồ sơ: {leads.length}
        </span>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {funnelStages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{stage.title}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 font-mono">
                  <strong className="text-slate-900">{stage.count}</strong>
                  <span className="text-slate-400 text-[11px]">({stage.percent}%)</span>
                </div>
              </div>

              {/* Bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.max(stage.percent, stage.count > 0 ? 3 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
