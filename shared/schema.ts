import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const phoneQueries = pgTable("phone_queries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull(),
  serviceProviderId: text("service_provider_id").notNull(),
  requestId: text("request_id"),
  consentGranted: boolean("consent_granted").default(true),
  responseCode: text("response_code"),
  responseMessage: text("response_message"),
  accountStatus: text("account_status"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPhoneQuerySchema = createInsertSchema(phoneQueries).omit({
  id: true,
  timestamp: true,
}).extend({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, "Invalid E.164 phone number format"),
  serviceProviderId: z.string().min(1, "Service Provider ID is required"),
  requestId: z.string().optional(),
  consentGranted: z.boolean().default(true),
});

export const phoneQueryRequestSchema = insertPhoneQuerySchema.pick({
  phoneNumber: true,
  serviceProviderId: true,
  requestId: true,
  consentGranted: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PhoneQuery = typeof phoneQueries.$inferSelect;
export type InsertPhoneQuery = z.infer<typeof insertPhoneQuerySchema>;
export type PhoneQueryRequest = z.infer<typeof phoneQueryRequestSchema>;

export interface AccountStatusResponse {
  responseCode: number;
  responseMessage?: string;
  accountStatus?: "ACTIVE" | "SUSPENDED";
  requestId?: string;
  phoneNumber?: string;
  timestamp?: string;
}
