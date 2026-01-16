import { supabase } from "@/integrations/supabase/client";

export type ContentType = "statistics" | "resources" | "faqs" | "seo";

export interface ResearchResult {
  success: boolean;
  data?: {
    stateName: string;
    stateAbbreviation: string;
    researchType: ContentType;
    content: string;
    citations: string[];
    timestamp: string;
  };
  error?: string;
}

export interface GeneratedContent {
  success: boolean;
  data?: {
    stateName: string;
    stateAbbreviation: string;
    contentType: ContentType;
    content: unknown;
    timestamp: string;
  };
  error?: string;
  rawContent?: string;
}

export interface QAReview {
  approved: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
  flaggedForHumanReview: boolean;
  reviewNotes: string;
}

export interface QAResult {
  success: boolean;
  data?: {
    stateName: string;
    contentType: ContentType;
    review: QAReview;
    timestamp: string;
  };
  error?: string;
}

export interface StateGenerationResult {
  stateName: string;
  stateAbbreviation: string;
  contentType: ContentType;
  year?: number;
  research: ResearchResult;
  generated: GeneratedContent;
  qa: QAResult;
  approved: boolean;
  content: unknown;
}

// Research a specific topic for a state using Perplexity
export async function researchState(
  stateName: string,
  stateAbbreviation: string,
  researchType: ContentType,
  year?: number
): Promise<ResearchResult> {
  const { data, error } = await supabase.functions.invoke("research-state", {
    body: { stateName, stateAbbreviation, researchType, year },
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return data;
}

// Generate content from research using Lovable AI
export async function generateContent(
  stateName: string,
  stateAbbreviation: string,
  contentType: ContentType,
  researchData: string,
  citations: string[],
  year?: number
): Promise<GeneratedContent> {
  const { data, error } = await supabase.functions.invoke("generate-content", {
    body: { stateName, stateAbbreviation, contentType, researchData, citations, year },
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return data;
}

// QA review generated content
export async function qaReview(
  stateName: string,
  contentType: ContentType,
  generatedContent: unknown,
  originalResearch: string
): Promise<QAResult> {
  const { data, error } = await supabase.functions.invoke("qa-review", {
    body: { stateName, contentType, generatedContent, originalResearch },
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return data;
}

// Full pipeline: Research -> Generate -> QA for a single state and content type
export async function generateStateContent(
  stateName: string,
  stateAbbreviation: string,
  contentType: ContentType,
  skipQA = false,
  year?: number
): Promise<StateGenerationResult> {
  // Step 1: Research
  const research = await researchState(stateName, stateAbbreviation, contentType, year);
  
  if (!research.success || !research.data) {
    return {
      stateName,
      stateAbbreviation,
      contentType,
      year,
      research,
      generated: { success: false, error: "Research failed" },
      qa: { success: false, error: "Skipped due to research failure" },
      approved: false,
      content: null,
    };
  }

  // Step 2: Generate content
  const generated = await generateContent(
    stateName,
    stateAbbreviation,
    contentType,
    research.data.content,
    research.data.citations,
    year
  );

  if (!generated.success || !generated.data) {
    return {
      stateName,
      stateAbbreviation,
      contentType,
      year,
      research,
      generated,
      qa: { success: false, error: "Skipped due to generation failure" },
      approved: false,
      content: null,
    };
  }

  // Step 3: QA Review (optional)
  let qa: QAResult;
  if (skipQA) {
    qa = {
      success: true,
      data: {
        stateName,
        contentType,
        review: {
          approved: true,
          score: 100,
          issues: [],
          suggestions: [],
          flaggedForHumanReview: false,
          reviewNotes: "QA skipped",
        },
        timestamp: new Date().toISOString(),
      },
    };
  } else {
    qa = await qaReview(
      stateName,
      contentType,
      generated.data.content,
      research.data.content
    );
  }

  const approved = qa.success && qa.data?.review.approved === true;

  return {
    stateName,
    stateAbbreviation,
    contentType,
    year,
    research,
    generated,
    qa,
    approved,
    content: generated.data.content,
  };
}

// Bulk generate content for multiple states
export async function bulkGenerateContent(
  states: Array<{ name: string; abbreviation: string }>,
  contentTypes: ContentType[],
  onProgress?: (completed: number, total: number, current: string) => void,
  skipQA = false,
  delayMs = 2000, // Delay between API calls to avoid rate limiting
  years?: number[] // For statistics, generate for multiple years
): Promise<StateGenerationResult[]> {
  const results: StateGenerationResult[] = [];
  
  // Calculate total: for statistics with years, multiply by year count
  const statsYears = years || [new Date().getFullYear()];
  let total = 0;
  for (const contentType of contentTypes) {
    if (contentType === "statistics") {
      total += states.length * statsYears.length;
    } else {
      total += states.length;
    }
  }
  
  let completed = 0;

  for (const state of states) {
    for (const contentType of contentTypes) {
      if (contentType === "statistics" && years && years.length > 0) {
        // For statistics, generate for each selected year
        for (const year of years) {
          onProgress?.(completed, total, `${state.name} - ${contentType} (${year})`);
          
          try {
            const result = await generateStateContent(
              state.name,
              state.abbreviation,
              contentType,
              skipQA,
              year
            );
            results.push(result);
          } catch (error) {
            results.push({
              stateName: state.name,
              stateAbbreviation: state.abbreviation,
              contentType,
              year,
              research: { success: false, error: String(error) },
              generated: { success: false, error: "Skipped" },
              qa: { success: false, error: "Skipped" },
              approved: false,
              content: null,
            });
          }
          
          completed++;
          
          if (completed < total) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        }
      } else {
        // For non-statistics content types
        onProgress?.(completed, total, `${state.name} - ${contentType}`);
        
        try {
          const result = await generateStateContent(
            state.name,
            state.abbreviation,
            contentType,
            skipQA
          );
          results.push(result);
        } catch (error) {
          results.push({
            stateName: state.name,
            stateAbbreviation: state.abbreviation,
            contentType,
            research: { success: false, error: String(error) },
            generated: { success: false, error: "Skipped" },
            qa: { success: false, error: "Skipped" },
            approved: false,
            content: null,
          });
        }
        
        completed++;
        
        if (completed < total) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
  }

  onProgress?.(total, total, "Complete");
  return results;
}
