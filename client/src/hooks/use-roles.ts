import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertUserRole } from "@shared/schema";

export function useUserRole(userId?: string) {
  return useQuery({
    queryKey: [api.users.getRole.path, userId],
    queryFn: async () => {
      if (!userId) return null;
      const url = buildUrl(api.users.getRole.path, { id: userId });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch role");
      return api.users.getRole.responses[200].parse(await res.json());
    },
    enabled: !!userId,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertUserRole) => {
      const res = await fetch(api.users.updateRole.path, {
        method: api.users.updateRole.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update role");
      return api.users.updateRole.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.users.getRole.path, data.userId] });
    },
  });
}
