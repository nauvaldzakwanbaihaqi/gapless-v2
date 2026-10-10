import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Pengunggahan bukti telah dipusatkan di Skill Passport. Silakan unggah sertifikat kamu melalui menu Skill Passport → Sertifikat & Portofolio.',
      redirectTo: '/passport#sertifikat',
    },
    { status: 410 }
  );
}
