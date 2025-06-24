import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../lib/db';

function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function POST() {
  const today = new Date().toISOString().slice(0, 10);
  // Get all available participants for today
  const { rows: participants } = await query(
    'SELECT name FROM lunch_participants WHERE available_today = true AND date = $1',
    [today]
  );
  let names = participants.map((p: any) => p.name);
  names = shuffle(names);

  // Fetch previous matches for the last 7 days
  const { rows: prevMatches } = await query(
    `SELECT name, matched_with, date FROM lunch_participants WHERE date >= $1`,
    [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)]
  );

  // Build a map of recent matches
  const recentPairs = new Set<string>();
  prevMatches.forEach((row: any) => {
    if (row.matched_with) {
      recentPairs.add([row.name, row.matched_with].sort().join('-'));
    }
  });

  const pairs: [string, string | null][] = [];
  while (names.length > 1) {
    let a = names.shift()!;
    let bIdx = names.findIndex(
      (n) => !recentPairs.has([a, n].sort().join('-'))
    );
    let b: string | undefined;
    if (bIdx !== -1) {
      b = names.splice(bIdx, 1)[0];
    } else {
      b = names.shift();
    }
    if (b) {
      pairs.push([a, b]);
      recentPairs.add([a, b].sort().join('-'));
    } else {
      pairs.push([a, null]);
    }
  }
  if (names.length === 1) {
    pairs.push([names[0], null]);
  }

  // Update DB with matches and reset availability
  for (const [a, b] of pairs) {
    await query(
      'UPDATE lunch_participants SET matched_with = $1, available_today = false WHERE name = $2 AND date = $3',
      [b, a, today]
    );
    if (b) {
      await query(
        'UPDATE lunch_participants SET matched_with = $1, available_today = false WHERE name = $2 AND date = $3',
        [a, b, today]
      );
    }
  }

  return NextResponse.json({ success: true, pairs });
} 