import React from 'react';
import { StudyProgram } from '@/types';
import { Award, Clock, DollarSign, Briefcase, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface ProgramCardProps {
  program: StudyProgram;
  onSelect?: (programId: string) => void;
}

export default function ProgramCard({ program, onSelect }: ProgramCardProps) {
  const isTroy = program.id.startsWith('troy');
  const isCmu = program.id.startsWith('cmu');
  const isPsu = program.id.startsWith('psu');
  const isCsu = program.id.startsWith('csu');

  const getPartnerBadgeColor = () => {
    if (isTroy) return 'bg-amber-100 text-amber-900 border-amber-300';
    if (isCmu) return 'bg-rose-100 text-rose-900 border-rose-300';
    if (isPsu) return 'bg-blue-100 text-blue-900 border-blue-300';
    return 'bg-emerald-100 text-emerald-900 border-emerald-300';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      
      {/* Top Header */}
      <div className="p-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getPartnerBadgeColor()}`}>
            {program.partner.split(' - ')[0]}
          </span>
          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
            Mã: {program.code}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors tracking-tight leading-snug">
          {program.name}
        </h3>

        {/* Accreditation */}
        <div className="flex items-center gap-1.5 mt-2.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/70">
          <Award className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{program.accreditation}</span>
        </div>

        {/* Description */}
        <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed">
          {program.description}
        </p>

        {/* Career prospects */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-start gap-1.5 text-xs text-slate-500">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2"><strong>Vị trí việc làm:</strong> {program.careerProspects}</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Tuition, Duration & CTA */}
      <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[11px] text-slate-400 block">Học phí chuẩn K32:</span>
          <span className="font-bold text-slate-900">{program.tuitionPerYear}</span>
        </div>

        <a
          href="#registration-form"
          onClick={() => onSelect && onSelect(program.id)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs hover:shadow-md transition-all group-hover:scale-105"
        >
          <span>Tư Vấn</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
