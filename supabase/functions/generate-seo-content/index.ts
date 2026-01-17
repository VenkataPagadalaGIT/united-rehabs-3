import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  stateId: string;
  stateName: string;
  pageTypes?: string[]; // Optional: specific page types to generate
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stateId, stateName, pageTypes = ['state_main', 'state_stats', 'state_rehabs', 'state_resources'] } = await req.json() as GenerateRequest;

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!PERPLEXITY_API_KEY || !LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log(`Generating SEO content for ${stateName} (${stateId})...`);

    // Research state-specific addiction data using Perplexity
    const researchPrompt = `Research ${stateName} addiction treatment and recovery landscape for SEO purposes. Include:
1. Key statistics about addiction in ${stateName} (overdose rates, treatment availability)
2. Major cities with treatment centers
3. Unique state programs or initiatives
4. Common substances of abuse in ${stateName}
5. Insurance and Medicaid coverage for treatment
Provide factual, current data from official sources.`;

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: 'You are an SEO research assistant specializing in healthcare and addiction treatment. Provide factual, well-researched information.' },
          { role: 'user', content: researchPrompt }
        ],
        search_domain_filter: ['samhsa.gov', 'cdc.gov', 'nih.gov', '.gov'],
        search_recency_filter: 'year',
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error('Perplexity API error:', errorText);
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

    const perplexityData = await perplexityResponse.json();
    const researchContent = perplexityData.choices?.[0]?.message?.content || '';
    const citations = perplexityData.citations || [];

    console.log(`Research complete for ${stateName}. Generating SEO content...`);

    // Generate structured SEO content using Lovable AI
    const seoPrompt = `Based on this research about ${stateName} addiction treatment:

${researchContent}

Generate SEO metadata for these page types. Return ONLY valid JSON, no markdown:

{
  "pages": [
    {
      "page_type": "state_main",
      "page_slug": "${stateId}-addiction-treatment",
      "meta_title": "[Under 60 chars, include '${stateName} Addiction Treatment' and year]",
      "meta_description": "[Under 160 chars, compelling with CTA, mention free resources]",
      "h1_title": "[Main heading for the page]",
      "intro_text": "[2-3 sentences introducing ${stateName} addiction resources]",
      "og_title": "[Social share title, can be slightly longer]",
      "og_description": "[Social share description, engaging tone]",
      "meta_keywords": ["keyword1", "keyword2", "...up to 10 relevant keywords"]
    },
    {
      "page_type": "state_stats",
      "page_slug": "${stateId}-addiction-statistics",
      "meta_title": "[Focus on statistics, data, numbers]",
      "meta_description": "[Highlight key stats, trends]",
      "h1_title": "[Statistics-focused heading]",
      "intro_text": "[Intro about ${stateName} addiction data]",
      "og_title": "[Stats-focused social title]",
      "og_description": "[Data-driven social description]",
      "meta_keywords": ["stats", "data", "...relevant keywords"]
    },
    {
      "page_type": "state_rehabs",
      "page_slug": "${stateId}-rehab-centers",
      "meta_title": "[Focus on treatment centers, rehabs]",
      "meta_description": "[Highlight finding treatment, centers]",
      "h1_title": "[Treatment-focused heading]",
      "intro_text": "[Intro about finding rehab in ${stateName}]",
      "og_title": "[Treatment-focused social title]",
      "og_description": "[Helpful, supportive tone]",
      "meta_keywords": ["rehab", "treatment centers", "...relevant keywords"]
    },
    {
      "page_type": "state_resources",
      "page_slug": "${stateId}-free-resources",
      "meta_title": "[Focus on free resources, hotlines, support]",
      "meta_description": "[Highlight free help, accessibility]",
      "h1_title": "[Resources-focused heading]",
      "intro_text": "[Intro about free resources in ${stateName}]",
      "og_title": "[Resources-focused social title]",
      "og_description": "[Emphasize free, accessible help]",
      "meta_keywords": ["free", "resources", "hotlines", "...relevant keywords"]
    }
  ]
}`;

    const lovableResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an SEO expert. Generate optimized meta content. Return ONLY valid JSON, no markdown fences or explanations.' 
          },
          { role: 'user', content: seoPrompt }
        ],
      }),
    });

    if (!lovableResponse.ok) {
      const errorText = await lovableResponse.text();
      console.error('Lovable AI error:', errorText);
      throw new Error(`Lovable AI error: ${lovableResponse.status}`);
    }

    const lovableData = await lovableResponse.json();
    let seoContent = lovableData.choices?.[0]?.message?.content || '';

    // Clean up response - remove markdown fences if present
    seoContent = seoContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsedContent;
    try {
      parsedContent = JSON.parse(seoContent);
    } catch (e) {
      console.error('Failed to parse SEO content:', seoContent);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Save to database
    const results = [];
    for (const page of parsedContent.pages) {
      if (!pageTypes.includes(page.page_type)) continue;

      // Check if SEO already exists for this state/page_type
      const { data: existing } = await supabase
        .from('page_seo')
        .select('id')
        .eq('state_id', stateId)
        .eq('page_type', page.page_type)
        .single();

      const seoRecord = {
        state_id: stateId,
        page_type: page.page_type,
        page_slug: page.page_slug,
        meta_title: page.meta_title,
        meta_description: page.meta_description,
        h1_title: page.h1_title,
        intro_text: page.intro_text,
        og_title: page.og_title,
        og_description: page.og_description,
        meta_keywords: page.meta_keywords,
        canonical_url: `https://unitedrehabs.lovable.app/${page.page_slug}`,
        robots: 'index, follow',
        is_active: true,
      };

      if (existing) {
        const { error } = await supabase
          .from('page_seo')
          .update(seoRecord)
          .eq('id', existing.id);
        
        if (error) {
          console.error(`Error updating SEO for ${page.page_type}:`, error);
        } else {
          results.push({ page_type: page.page_type, action: 'updated' });
        }
      } else {
        const { error } = await supabase
          .from('page_seo')
          .insert(seoRecord);
        
        if (error) {
          console.error(`Error inserting SEO for ${page.page_type}:`, error);
        } else {
          results.push({ page_type: page.page_type, action: 'created' });
        }
      }
    }

    console.log(`Successfully saved ${results.length} SEO records for ${stateName}`);

    return new Response(JSON.stringify({
      success: true,
      data: {
        stateId,
        stateName,
        results,
        citations,
        timestamp: new Date().toISOString(),
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Generate SEO content error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
