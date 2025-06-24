import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron job secret (optional but recommended)
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get all signups for today
    const { data: signups, error: fetchError } = await supabase
      .from('signups')
      .select('name')
      .eq('date', today);

    if (fetchError) {
      console.error('Error fetching signups:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch signups' });
    }

    if (!signups || signups.length === 0) {
      return res.status(200).json({ message: 'No signups for today' });
    }

    // Shuffle the signups array
    const shuffled = [...signups].sort(() => Math.random() - 0.5);
    
    // Create pairs (if odd number, last person gets no match)
    const pairs = [];
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      pairs.push({
        person1: shuffled[i].name,
        person2: shuffled[i + 1].name,
        date: today
      });
    }

    // Insert matches into the database
    if (pairs.length > 0) {
      const { error: insertError } = await supabase
        .from('matches')
        .insert(pairs);

      if (insertError) {
        console.error('Error inserting matches:', insertError);
        return res.status(500).json({ error: 'Failed to insert matches' });
      }
    }

    // Handle the case where there's an odd number of people
    if (shuffled.length % 2 === 1) {
      const { error: noMatchError } = await supabase
        .from('matches')
        .insert({
          person1: shuffled[shuffled.length - 1].name,
          person2: null, // No match
          date: today
        });

      if (noMatchError) {
        console.error('Error inserting no-match record:', noMatchError);
      }
    }

    console.log(`Successfully matched ${pairs.length} pairs for ${today}`);
    return res.status(200).json({ 
      message: 'Matching completed',
      pairs: pairs.length,
      totalSignups: shuffled.length
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
