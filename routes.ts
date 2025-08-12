import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProcessSchema, updateProcessSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Process routes
  app.get('/api/processes', isAuthenticated, async (req, res) => {
    try {
      const processes = await storage.getAllProcesses();
      res.json(processes);
    } catch (error) {
      console.error("Error fetching processes:", error);
      res.status(500).json({ message: "Failed to fetch processes" });
    }
  });

  app.get('/api/processes/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const process = await storage.getProcess(id);
      if (!process) {
        return res.status(404).json({ message: "Process not found" });
      }
      res.json(process);
    } catch (error) {
      console.error("Error fetching process:", error);
      res.status(500).json({ message: "Failed to fetch process" });
    }
  });

  app.post('/api/processes', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProcessSchema.parse(req.body);
      const process = await storage.createProcess(validatedData);
      res.status(201).json(process);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating process:", error);
      res.status(500).json({ message: "Failed to create process" });
    }
  });

  app.patch('/api/processes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.claims?.sub;
      
      // Check if user is admin for certain admin-only operations
      const adminOnlyFields = ['status', 'progress', 'errorMessage', 'estimatedDuration'];
      const hasAdminOnlyFields = Object.keys(req.body).some(key => adminOnlyFields.includes(key));
      
      if (hasAdminOnlyFields) {
        const user = await storage.getUser(userId);
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ message: 'Admin access required for this operation' });
        }
      }
      
      const validatedData = updateProcessSchema.parse(req.body);
      const process = await storage.updateProcess(id, validatedData);
      if (!process) {
        return res.status(404).json({ message: "Process not found" });
      }
      res.json(process);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating process:", error);
      res.status(500).json({ message: "Failed to update process" });
    }
  });

  app.delete('/api/processes/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProcess(id);
      if (!deleted) {
        return res.status(404).json({ message: "Process not found" });
      }
      res.json({ message: "Process deleted successfully" });
    } catch (error) {
      console.error("Error deleting process:", error);
      res.status(500).json({ message: "Failed to delete process" });
    }
  });

  // Process actions
  app.post('/api/processes/:id/start', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const process = await storage.updateProcess(id, {
        status: 'running',
        startedAt: new Date(),
        progress: 0,
        errorMessage: null,
      });
      if (!process) {
        return res.status(404).json({ message: "Process not found" });
      }
      res.json(process);
    } catch (error) {
      console.error("Error starting process:", error);
      res.status(500).json({ message: "Failed to start process" });
    }
  });

  app.post('/api/processes/:id/pause', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const process = await storage.updateProcess(id, {
        status: 'paused',
      });
      if (!process) {
        return res.status(404).json({ message: "Process not found" });
      }
      res.json(process);
    } catch (error) {
      console.error("Error pausing process:", error);
      res.status(500).json({ message: "Failed to pause process" });
    }
  });

  app.post('/api/processes/:id/stop', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const process = await storage.updateProcess(id, {
        status: 'stopped',
        completedAt: new Date(),
      });
      if (!process) {
        return res.status(404).json({ message: "Process not found" });
      }
      res.json(process);
    } catch (error) {
      console.error("Error stopping process:", error);
      res.status(500).json({ message: "Failed to stop process" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
