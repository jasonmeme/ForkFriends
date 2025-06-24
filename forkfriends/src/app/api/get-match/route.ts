import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  if (!name) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }
  const today = new Date().toISOString().slice(0, 10);
  const result = await query(
    'SELECT matched_with FROM lunch_participants WHERE name = $1 AND date = $2',
    [name, today]
  );
  if (result.rows.length === 0) {
    return NextResponse.json({ match: null });
  }
  return NextResponse.json({ match: result.rows[0].matched_with });
} 