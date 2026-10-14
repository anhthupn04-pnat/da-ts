import { NextResponse } from 'next/server';
import { STUDY_PROGRAMS } from '@/data/programsData';

export async function GET() {
  return NextResponse.json({
    success: true,
    total: STUDY_PROGRAMS.length,
    programs: STUDY_PROGRAMS
  });
}
