import {
  users,
  processes,
  type User,
  type UpsertUser,
  type Process,
  type InsertProcess,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Process operations
  getAllProcesses(): Promise<Process[]>;
  getProcess(id: string): Promise<Process | undefined>;
  createProcess(process: InsertProcess): Promise<Process>;
  updateProcess(id: string, updates: Partial<InsertProcess>): Promise<Process | undefined>;
  deleteProcess(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Process operations
  async getAllProcesses(): Promise<Process[]> {
    return await db
      .select()
      .from(processes)
      .orderBy(desc(processes.createdAt));
  }

  async getProcess(id: string): Promise<Process | undefined> {
    const [process] = await db
      .select()
      .from(processes)
      .where(eq(processes.id, id));
    return process;
  }

  async createProcess(process: InsertProcess): Promise<Process> {
    const [newProcess] = await db
      .insert(processes)
      .values(process)
      .returning();
    return newProcess;
  }

  async updateProcess(id: string, updates: Partial<InsertProcess>): Promise<Process | undefined> {
    const [updatedProcess] = await db
      .update(processes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(processes.id, id))
      .returning();
    return updatedProcess;
  }

  async deleteProcess(id: string): Promise<boolean> {
    const result = await db
      .delete(processes)
      .where(eq(processes.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
