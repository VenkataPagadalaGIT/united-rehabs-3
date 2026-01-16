import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stateName, stateAbbreviation, startYear, endYear } = await req.json();
    console.log(`Generating stats for ${stateName} (${startYear}-${endYear})...`);

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!PERPLEXITY_API_KEY || !LOVABLE_API_KEY) throw new Error('Missing API keys');

    // ONE research call
    const researchResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${PERPLEXITY_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: `Historical addiction stats for ${stateName} ${startYear}-${endYear}: overdose deaths, opioid deaths, fentanyl deaths, treatment data, substance use rates by year. Include CDC WONDER, SAMHSA data.` }],
        search_domain_filter: ['.gov'],
      }),
    });
    const research = await researchResponse.json();
    const researchText = research.choices[0].message.content;
    console.log('Research done, generating data...');

    // Generate in batches of 7 years
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    const allStats: any[] = [];
    const allSubstance: any[] = [];

    for (let i = 0; i < years.length; i += 7) {
      const batch = years.slice(i, i + 7);
      const prompt = `Based on research for ${stateName}: ${researchText.substring(0, 3000)}

Generate JSON for years ${batch.join(',')}:
{"statistics":[{"year":N,"state_id":"${stateAbbreviation.toLowerCase()}","state_name":"${stateName}","total_affected":N,"overdose_deaths":N,"opioid_deaths":N,"alcohol_abuse_rate":N,"drug_abuse_rate":N,"treatment_admissions":N,"recovery_rate":N,"relapse_rate":N,"affected_age_12_17":N,"affected_age_18_25":N,"affected_age_26_34":N,"affected_age_35_plus":N,"total_treatment_centers":N,"inpatient_facilities":N,"outpatient_facilities":N,"economic_cost_billions":N,"data_source":"CDC/SAMHSA","source_url":"https://wonder.cdc.gov/"}],
"substance_statistics":[{"year":N,"state_id":"${stateAbbreviation.toLowerCase()}","state_name":"${stateName}","alcohol_use_disorder":N,"opioid_use_disorder":N,"fentanyl_deaths":N,"cocaine_related_deaths":N,"meth_related_deaths":N,"marijuana_use_past_year":N,"treatment_received":N}]}

Rules: fentanyl_deaths=0 before 2013. Return ONLY JSON.`;

      const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'google/gemini-2.5-flash', messages: [{ role: 'user', content: prompt }] }),
      });
      const aiData = await aiResp.json();
      const content = aiData.choices?.[0]?.message?.content || '';
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.statistics) allStats.push(...parsed.statistics);
        if (parsed.substance_statistics) allSubstance.push(...parsed.substance_statistics);
      }
      console.log(`Batch ${batch[0]}-${batch[batch.length-1]} done`);
    }

    return new Response(JSON.stringify({ success: true, data: { statistics: allStats, substance_statistics: allSubstance }, yearsGenerated: years.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
