import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  stateName: string;
  stateAbbreviation: string;
  year: number;
}

// Admin authentication helper
async function verifyAdminAuth(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized - missing authentication" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized - invalid token" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check if user has admin role
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single();

  if (!roleData) {
    return new Response(
      JSON.stringify({ success: false, error: "Forbidden - Admin access required" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return { userId: user.id };
}

// Verify and update state data with official sources
async function verifyStateData(
  stateName: string,
  stateAbbreviation: string,
  year: number
): Promise<{ verified: boolean; changes: any; sources: string[] }> {
  const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!PERPLEXITY_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required env vars');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const stateId = stateAbbreviation.toLowerCase();

  // Get current data
  const { data: currentStats } = await supabase
    .from('state_addiction_statistics')
    .select('*')
    .eq('state_id', stateId)
    .eq('year', year)
    .single();

  const { data: currentSubstance } = await supabase
    .from('substance_statistics')
    .select('*')
    .eq('state_id', stateId)
    .eq('year', year)
    .single();

  // Use Perplexity with ONLY .gov sources for official data
  const researchResp = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [{
        role: 'system',
        content: `You are a data verification specialist. Only cite EXACT numbers from official government sources (CDC WONDER, SAMHSA NSDUH, state health department reports). If an exact number is not available from an official source, respond with "NOT_AVAILABLE". Do not estimate or interpolate.`
      }, {
        role: 'user',
        content: `Find the EXACT official statistics for ${stateName} (${stateAbbreviation}) for year ${year}:

1. Total drug overdose deaths - from CDC WONDER
2. Opioid-involved overdose deaths - from CDC WONDER  
3. Fentanyl/synthetic opioid deaths - from CDC WONDER
4. Total individuals with substance use disorder - from SAMHSA NSDUH
5. Treatment admissions - from SAMHSA TEDS or state reports

For each statistic, provide:
- The EXACT number (no estimates, no ranges)
- The official source URL
- If NOT available from an official source, state "NOT_AVAILABLE"

Return ONLY a JSON object:
{
  "overdose_deaths": {"value": NUMBER_OR_NULL, "source": "URL_OR_NOT_AVAILABLE", "confidence": "verified|partial|unavailable"},
  "opioid_deaths": {"value": NUMBER_OR_NULL, "source": "URL_OR_NOT_AVAILABLE", "confidence": "verified|partial|unavailable"},
  "fentanyl_deaths": {"value": NUMBER_OR_NULL, "source": "URL_OR_NOT_AVAILABLE", "confidence": "verified|partial|unavailable"},
  "total_affected": {"value": NUMBER_OR_NULL, "source": "URL_OR_NOT_AVAILABLE", "confidence": "verified|partial|unavailable"},
  "treatment_admissions": {"value": NUMBER_OR_NULL, "source": "URL_OR_NOT_AVAILABLE", "confidence": "verified|partial|unavailable"}
}`
      }],
      search_domain_filter: ['cdc.gov', 'samhsa.gov', 'wonder.cdc.gov'],
    }),
  });

  if (!researchResp.ok) {
    throw new Error(`Perplexity API error: ${researchResp.status}`);
  }

  const research = await researchResp.json();
  const content = research.choices[0].message.content;
  const citations = research.citations || [];
  
  // Parse JSON response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse verification response');
  }

  const verifiedData = JSON.parse(jsonMatch[0]);
  const changes: any = {};
  const sources: string[] = [];

  // Compare and update only verified data
  const statsUpdates: any = {};
  const substanceUpdates: any = {};

  // Process each field
  if (verifiedData.overdose_deaths?.confidence === 'verified' && verifiedData.overdose_deaths?.value) {
    const newVal = Math.round(verifiedData.overdose_deaths.value);
    if (currentStats?.overdose_deaths !== newVal) {
      statsUpdates.overdose_deaths = newVal;
      changes.overdose_deaths = { old: currentStats?.overdose_deaths, new: newVal };
    }
    if (verifiedData.overdose_deaths.source) sources.push(verifiedData.overdose_deaths.source);
  }

  if (verifiedData.opioid_deaths?.confidence === 'verified' && verifiedData.opioid_deaths?.value) {
    const newVal = Math.round(verifiedData.opioid_deaths.value);
    if (currentStats?.opioid_deaths !== newVal) {
      statsUpdates.opioid_deaths = newVal;
      changes.opioid_deaths = { old: currentStats?.opioid_deaths, new: newVal };
    }
    if (verifiedData.opioid_deaths.source) sources.push(verifiedData.opioid_deaths.source);
  }

  if (verifiedData.fentanyl_deaths?.confidence === 'verified' && verifiedData.fentanyl_deaths?.value) {
    const newVal = Math.round(verifiedData.fentanyl_deaths.value);
    if (currentSubstance?.fentanyl_deaths !== newVal) {
      substanceUpdates.fentanyl_deaths = newVal;
      changes.fentanyl_deaths = { old: currentSubstance?.fentanyl_deaths, new: newVal };
    }
    if (verifiedData.fentanyl_deaths.source) sources.push(verifiedData.fentanyl_deaths.source);
  }

  if (verifiedData.total_affected?.confidence === 'verified' && verifiedData.total_affected?.value) {
    const newVal = Math.round(verifiedData.total_affected.value);
    if (currentStats?.total_affected !== newVal) {
      statsUpdates.total_affected = newVal;
      changes.total_affected = { old: currentStats?.total_affected, new: newVal };
    }
    if (verifiedData.total_affected.source) sources.push(verifiedData.total_affected.source);
  }

  if (verifiedData.treatment_admissions?.confidence === 'verified' && verifiedData.treatment_admissions?.value) {
    const newVal = Math.round(verifiedData.treatment_admissions.value);
    if (currentStats?.treatment_admissions !== newVal) {
      statsUpdates.treatment_admissions = newVal;
      changes.treatment_admissions = { old: currentStats?.treatment_admissions, new: newVal };
    }
    if (verifiedData.treatment_admissions.source) sources.push(verifiedData.treatment_admissions.source);
  }

  // Apply updates
  if (Object.keys(statsUpdates).length > 0) {
    statsUpdates.updated_at = new Date().toISOString();
    statsUpdates.data_source = 'CDC WONDER/SAMHSA (Verified)';
    
    await supabase
      .from('state_addiction_statistics')
      .update(statsUpdates)
      .eq('state_id', stateId)
      .eq('year', year);
  }

  if (Object.keys(substanceUpdates).length > 0) {
    substanceUpdates.updated_at = new Date().toISOString();
    
    await supabase
      .from('substance_statistics')
      .update(substanceUpdates)
      .eq('state_id', stateId)
      .eq('year', year);
  }

  // Add citation sources
  sources.push(...citations.filter((c: string) => c.includes('.gov')));

  return {
    verified: Object.keys(changes).length === 0,
    changes,
    sources: [...new Set(sources)]
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(req);
    if (authResult instanceof Response) {
      return authResult;
    }

    const body: VerifyRequest | VerifyRequest[] = await req.json();
    const requests = Array.isArray(body) ? body : [body];

    const results = [];

    for (const request of requests) {
      try {
        const result = await verifyStateData(
          request.stateName,
          request.stateAbbreviation,
          request.year
        );
        results.push({
          state: request.stateName,
          year: request.year,
          ...result
        });
      } catch (err) {
        results.push({
          state: request.stateName,
          year: request.year,
          error: String(err)
        });
      }

      // Small delay between states
      if (requests.length > 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(error) 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
