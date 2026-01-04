import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PageContent {
  id: string;
  page_key: string;
  section_key: string;
  content_type: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  metadata: Record<string, unknown> | null;
  sort_order: number | null;
  is_active: boolean | null;
}

export function usePageContent(pageKey: string, sectionKey?: string) {
  return useQuery({
    queryKey: ["page-content", pageKey, sectionKey],
    queryFn: async () => {
      let query = supabase
        .from("page_content")
        .select("*")
        .eq("page_key", pageKey)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (sectionKey) {
        query = query.eq("section_key", sectionKey);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PageContent[];
    },
    enabled: !!pageKey,
  });
}

export function useHeroContent(pageKey: string) {
  const { data, isLoading } = usePageContent(pageKey, "hero");
  
  const hero = data?.[0];
  
  return {
    title: hero?.title || null,
    subtitle: hero?.subtitle || null,
    body: hero?.body || null,
    isLoading,
  };
}
