import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron job secret (optional but recommended)
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    
    // Get all signups for today
    const { data: signups, error: fetchError } = await supabase
      .from('daily_signups')
      .select('name')
      .eq('date', todayStr);

    if (fetchError) {
      console.error('Error fetching signups:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch signups' });
    }

    if (!signups || signups.length === 0) {
      return res.status(200).json({ message: 'No signups for today' });
    }

    // Shuffle the signups array
    const shuffled = [...signups].sort(() => Math.random() - 0.5);
    
    // Create groups: pairs of 2, and if odd number, make the last group of 3
    const groups = [];
    const totalPeople = shuffled.length;
    let i = 0;

    if (totalPeople % 2 === 1) {
      // Odd number: last group is 3
      for (i = 0; i < totalPeople - 3; i += 2) {
        groups.push({
          person1: shuffled[i].name,
          person2: shuffled[i + 1].name,
          person3: null,
          date: todayStr
        });
      }
      // Last group of 3
      groups.push({
        person1: shuffled[totalPeople - 3].name,
        person2: shuffled[totalPeople - 2].name,
        person3: shuffled[totalPeople - 1].name,
        date: todayStr
      });
    } else {
      // Even number: all groups are pairs
      for (i = 0; i < totalPeople; i += 2) {
        groups.push({
          person1: shuffled[i].name,
          person2: shuffled[i + 1].name,
          person3: null,
          date: todayStr
        });
      }
    }

    // Insert matches into the matches table
    if (groups.length > 0) {
      const { error: insertError } = await supabase
        .from('matches')
        .insert(groups);

      if (insertError) {
        console.error('Error inserting matches:', insertError);
        return res.status(500).json({ error: 'Failed to insert matches' });
      }
    }

    // Update the matched status for all users in daily_signups
    const allNames = shuffled.map(signup => signup.name);
    if (allNames.length > 0) {
      const { error: updateError } = await supabase
        .from('daily_signups')
        .update({ matched: true })
        .eq('date', todayStr)
        .in('name', allNames);

      if (updateError) {
        console.error('Error updating matched status:', updateError);
        // Don't return error here as matches were already created
      }
    }

    const groupsOf3 = groups.length - totalPeople / 2;
    const groupsOf2 = totalPeople / 2 - groupsOf3;
    
    console.log(`Successfully created ${groups.length} groups for ${todayStr} (${groupsOf2} pairs, ${groupsOf3} group of 3)`);
    return res.status(200).json({ 
      message: 'Matching completed',
      totalGroups: groups.length,
      groupsOf2: groupsOf2,
      groupsOf3: groupsOf3,
      totalSignups: shuffled.length
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
