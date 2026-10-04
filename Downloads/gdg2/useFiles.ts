import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { listFiles } from "@/services/files";

export function useFiles() {
  const { user, configured } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["usar-files", user?.id ?? "signed-out"],
    queryFn: () => {
      if (!user) throw new Error("Please log in to view your files.");
      return listFiles(user);
    },
    enabled: Boolean(configured && user),
    staleTime: 15_000,
  });

  return {
    files: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refresh: () => queryClient.invalidateQueries({ queryKey: ["usar-files", user?.id ?? "signed-out"] }),
  };
}
