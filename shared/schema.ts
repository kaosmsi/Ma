import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  priceBtc: real("price_btc").notNull(), // Price in BTC
  image: text("image"), // Optional image URL
  quantity: integer("quantity").notNull().default(1),
  inStock: boolean("in_stock").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  email: text("email").notNull(), // Customer email
  priceBtc: real("price_btc").notNull(), // BTC price at time of order
  status: text("status").notNull().default("pending"), // pending, paid
  txHash: text("tx_hash"), // User provided transaction hash
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const updateProductSchema = createInsertSchema(products).omit({ id: true }).partial();
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, status: true });

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type Order = typeof orders.$inferSelect;
export const config = pgTable("config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const insertConfigSchema = createInsertSchema(config).omit({ id: true });
export type Config = typeof config.$inferSelect;
export type InsertConfig = z.infer<typeof insertConfigSchema>;
