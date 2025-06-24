import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    // Look for matches where this person is either person1, person2, or person3
    const { data: matches, error } = await supabase
      .from('matches')
      .select('person1, person2, person3')
      .eq('date', todayStr)
      .or(`person1.eq.${name},person2.eq.${name},person3.eq.${name}`);

    if (error) {
      console.error('Error fetching match:', error);
      return res.status(500).json({ error: 'Failed to fetch match' });
    }

    if (!matches || matches.length === 0) {
      // No match found yet
      return res.status(200).json({ match: null });
    }

    const match = matches[0];
    
    // Create array of all people in the group (excluding the current user)
    const groupMembers = [];
    if (match.person1 && match.person1 !== name) {
      groupMembers.push(match.person1);
    }
    if (match.person2 && match.person2 !== name) {
      groupMembers.push(match.person2);
    }
    if (match.person3 && match.person3 !== name) {
      groupMembers.push(match.person3);
    }
    
    // Return the group members
    return res.status(200).json({ 
      match: groupMembers,
      groupSize: groupMembers.length + 1 // +1 to include the current user
    });

  } catch (error) {
    console.error('Get match error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 