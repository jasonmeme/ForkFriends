import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../lib/db';

export async function POST(req: NextRequest) {
  const { name, available_today } = await req.json();
  if (!name || typeof available_today !== 'boolean') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const today = new Date().toISOString().slice(0, 10);
  // Upsert participant for today
  await query(
    `INSERT INTO lunch_participants (name, available_today, date)
     VALUES ($1, $2, $3)
     ON CONFLICT (name, date) DO UPDATE SET available_today = $2`,
    [name, available_today, today]
  );
  return NextResponse.json({ success: true });
} 