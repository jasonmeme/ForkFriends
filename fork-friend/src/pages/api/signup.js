import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name } = req.body;
  if (!name || typeof name !== "string" || !/^[a-zA-Z\s'-]{1,50}$/.test(name.trim())) {
    return res.status(400).json({ error: "Name must be 1-50 letters, spaces, hyphens, or apostrophes." });
  }
  const trimmedName = name.trim();

  // Get today's date in YYYY-MM-DD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  // Check for duplicate signup
  const { data: existing, error: checkError } = await supabase
    .from('daily_signups')
    .select('id')
    .eq('name', trimmedName)
    .eq('date', todayStr)
    .maybeSingle();

  if (checkError) {
    return res.status(500).json({ error: "Database error. Please try again." });
  }
  if (existing) {
    return res.status(409).json({ error: "You have already signed up for today." });
  }

  // Insert new signup
  const { error: insertError } = await supabase
    .from('daily_signups')
    .insert({ name: trimmedName, date: todayStr, matched: false });

  if (insertError) {
    return res.status(500).json({ error: "Could not sign up. Please try again." });
  }

  return res.status(200).json({ success: true });
}
