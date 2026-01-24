import { useQuery } from "@tanstack/react-query";
import { pageContentApi } from "@/lib/api";

interface PageContent {
  id: string;
  page_key: string;
  section_key: string;
  content_type: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  state_id: string | null;
  is_active: boolean;
  sort_order: number;
}

export const usePageContent = (pageKey: string, stateId?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["page-content", pageKey, stateId],
    queryFn: async () => {
      return await pageContentApi.getAll({ page_key: pageKey, state_id: stateId });
    },
  });

  return {
    content: data || [],
    isLoading,
    error,
  };
};

export const useHeroContent = (pageKey: string, stateId?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["hero-content", pageKey, stateId],
    queryFn: async () => {
      const result = await pageContentApi.getAll({ 
        page_key: pageKey, 
        state_id: stateId 
      });
      // Find hero section
      const heroContent = result?.find((c: PageContent) => c.section_key === "hero");
      return heroContent || null;
    },
  });

  return {
    hero: data as PageContent | null,
    isLoading,
    error,
    title: data?.title || "",
    subtitle: data?.subtitle || "",
    body: data?.body || "",
  };
};

export const useSectionContent = (pageKey: string, sectionKey: string, stateId?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["section-content", pageKey, sectionKey, stateId],
    queryFn: async () => {
      const result = await pageContentApi.getAll({ 
        page_key: pageKey, 
        state_id: stateId 
      });
      const sectionContent = result?.find((c: PageContent) => c.section_key === sectionKey);
      return sectionContent || null;
    },
  });

  return {
    content: data as PageContent | null,
    isLoading,
    error,
  };
};
