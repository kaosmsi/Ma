import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertOrder } from "@shared/routes";
import { type Product, type Order } from "@shared/schema";

// GET /api/products
export function useProducts() {
  return useQuery<Product[]>({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      const res = await fetch(api.products.list.path);
      if (!res.ok) throw new Error("Failed to fetch products");
      // Basic sorting mentioned in requirements: Price low to high
      const data = await res.json();
      return api.products.list.responses[200].parse(data).sort((a, b) => a.priceBtc - b.priceBtc);
    },
  });
}

// GET /api/products/:id
export function useProduct(id: number) {
  return useQuery<Product>({
    queryKey: [api.products.get.path, id],
    queryFn: async () => {
      const url = api.products.get.path.replace(":id", String(id));
      const res = await fetch(url);
      if (res.status === 404) throw new Error("Product not found");
      if (!res.ok) throw new Error("Failed to fetch product");
      return api.products.get.responses[200].parse(await res.json());
    },
  });
}

// POST /api/orders
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderData: InsertOrder) => {
      const validated = api.orders.create.input.parse(orderData);
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.orders.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create order");
      }
      return api.orders.create.responses[201].parse(await res.json());
    },
    // No need to invalidate products list as stock isn't tracked in this simple schema
    // But if we had an orders list, we'd invalidate that
  });
}
