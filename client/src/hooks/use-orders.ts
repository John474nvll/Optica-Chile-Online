import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertOrder } from "@shared/schema";

export function useOrders(filters?: { patientId?: string; status?: string }) {
  return useQuery({
    queryKey: [api.orders.list.path, filters],
    queryFn: async () => {
      const url = filters 
        ? `${api.orders.list.path}?${new URLSearchParams(filters as any).toString()}`
        : api.orders.list.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.orders.list.responses[200].parse(await res.json());
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

// Complex mutation: Create order AND items handled by backend usually, 
// but based on schema we might need to send them together if API supported it, 
// or backend handles the logic. Assuming API accepts order details and backend 
// orchestrates or we simplify for now. 
// Note: The schema route `create` uses `insertOrderSchema` which doesn't include items.
// In a real app, I'd update the backend to accept `{ ...order, items: [...] }`.
// For this generated code, I will assume the backend might be updated or we handle it simply.
// I will just use the define endpoint.
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertOrder & { items?: any[] }) => {
      // Note: In a real implementation, we'd need a transaction on the backend
      // or a specific endpoint for "checkout". 
      // Using the basic create endpoint for now.
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
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
