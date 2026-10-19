import { NextResponse } from 'next/server';
import { verifyCandidateDocuments, getSafeCurrentUser } from '@/data/storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateId, status, scoreMath, scoreLiterature, scoreEnglish, notes, verifier } = body;

    if (!candidateId || !status) {
      return NextResponse.json(
        { success: false, error: 'Thiếu mã hồ sơ thí sinh hoặc trạng thái duyệt.' },
        { status: 400 }
      );
    }

    const currentVerifier = verifier || getSafeCurrentUser();

    const result = verifyCandidateDocuments(candidateId, {
      status,
      verifiedScoreMath: scoreMath ? Number(scoreMath) : undefined,
      verifiedScoreLiterature: scoreLiterature ? Number(scoreLiterature) : undefined,
      verifiedScoreEnglish: scoreEnglish ? Number(scoreEnglish) : undefined,
      notes
    }, currentVerifier);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, lead: result.lead });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
