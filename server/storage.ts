import { type User, type InsertUser, type PhoneQuery, type InsertPhoneQuery } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createPhoneQuery(query: InsertPhoneQuery): Promise<PhoneQuery>;
  getRecentPhoneQueries(limit?: number): Promise<PhoneQuery[]>;
  clearPhoneQueryHistory(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private phoneQueries: Map<string, PhoneQuery>;

  constructor() {
    this.users = new Map();
    this.phoneQueries = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPhoneQuery(insertQuery: InsertPhoneQuery): Promise<PhoneQuery> {
    const id = randomUUID();
    const query: PhoneQuery = {
      ...insertQuery,
      id,
      timestamp: new Date(),
    };
    this.phoneQueries.set(id, query);
    return query;
  }

  async getRecentPhoneQueries(limit: number = 10): Promise<PhoneQuery[]> {
    const queries = Array.from(this.phoneQueries.values());
    return queries
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async clearPhoneQueryHistory(): Promise<void> {
    this.phoneQueries.clear();
  }
}

export const storage = new MemStorage();
