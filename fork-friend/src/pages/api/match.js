import { supabase } from "@/lib/supabase";

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
    let i = 0;
    
    // If we have an odd number of people, we'll make the last group of 3
    const totalPeople = shuffled.length;
    const pairsCount = Math.floor(totalPeople / 2);
    const hasOddGroup = totalPeople % 2 === 1;
    
    // Create regular pairs
    for (i = 0; i < pairsCount - (hasOddGroup ? 1 : 0); i++) {
      groups.push({
        person1: shuffled[i * 2].name,
        person2: shuffled[i * 2 + 1].name,
        person3: null,
        date: todayStr
      });
    }
    
    // Handle the last group (could be 2 or 3 people)
    if (hasOddGroup) {
      // Last group of 3 people
      const lastIndex = pairsCount - 1;
      groups.push({
        person1: shuffled[lastIndex * 2].name,
        person2: shuffled[lastIndex * 2 + 1].name,
        person3: shuffled[lastIndex * 2 + 2].name,
        date: todayStr
      });
    } else if (pairsCount > 0) {
      // Last group of 2 people
      const lastIndex = pairsCount - 1;
      groups.push({
        person1: shuffled[lastIndex * 2].name,
        person2: shuffled[lastIndex * 2 + 1].name,
        person3: null,
        date: todayStr
      });
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

    const groupsOf3 = hasOddGroup ? 1 : 0;
    const groupsOf2 = groups.length - groupsOf3;
    
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
