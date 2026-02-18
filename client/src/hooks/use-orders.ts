import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { InsertOrder } from "@shared/schema";

export function useOrders(patientId?: string) {
  return useQuery({
    queryKey: [api.orders.list.path, patientId],
    queryFn: async () => {
      const url = patientId 
        ? `${api.orders.list.path}?patientId=${patientId}` 
        : api.orders.list.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.orders.list.responses[200].parse(await res.json());
    },
  });
}

type CreateOrderInput = InsertOrder & { items: { productId: number; quantity: number }[] };

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrderInput) => {
      const res = await fetch(api.orders.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create order");
      return api.orders.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    },
  });
}

export function useOrderItems(orderId: number) {
  return useQuery({
    queryKey: [api.orders.getOrderItems.path, orderId],
    queryFn: async () => {
      const url = buildUrl(api.orders.getOrderItems.path, { id: orderId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch order items");
      return api.orders.getOrderItems.responses[200].parse(await res.json());
    },
    enabled: !!orderId,
  });
}
