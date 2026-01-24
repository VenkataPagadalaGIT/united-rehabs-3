import { useQuery } from "@tanstack/react-query";
import { pageContentApi } from "@/lib/api";

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
