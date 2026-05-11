import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const control = await prisma.control.findUnique({
      where: { id: 'singleton' },
    });
    return NextResponse.json({ buzzer: control?.buzzer ?? false });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { buzzer } = await req.json();
    if (buzzer === undefined) {
      return NextResponse.json({ error: 'Missing buzzer state' }, { status: 400 });
    }

    const control = await prisma.control.upsert({
      where: { id: 'singleton' },
      update: { buzzer },
      create: { id: 'singleton', buzzer },
    });

    return NextResponse.json({ success: true, buzzer: control.buzzer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
