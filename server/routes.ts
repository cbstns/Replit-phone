import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { phoneQueryRequestSchema, type AccountStatusResponse } from "@shared/schema";
import { getAccountStatusByMsisdn } from "./services/enstream";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Check account status endpoint
  app.post("/api/account-status", async (req, res) => {
    try {
      // Validate request body
      const validatedData = phoneQueryRequestSchema.parse(req.body);
      
      const { phoneNumber, serviceProviderId, requestId, consentGranted } = validatedData;
      
      // Get credentials from environment variables
      const username = process.env.ENSTREAM_QA_USER || process.env.ENSTREAM_USERNAME || "10096";
      const password = process.env.ENSTREAM_QA_PASS || process.env.ENSTREAM_PASSWORD;
      
      if (!password) {
        return res.status(500).json({ 
          message: "EnStream credentials not configured. Please set ENSTREAM_QA_PASS or ENSTREAM_PASSWORD environment variable." 
        });
      }

      // Call EnStream API
      const result = await getAccountStatusByMsisdn({
        msisdn: phoneNumber,
        username,
        password,
        serviceProviderId,
        consentGranted,
        requestId: requestId || randomUUID(),
      });

      // Store query in history
      await storage.createPhoneQuery({
        phoneNumber,
        serviceProviderId,
        requestId: requestId || randomUUID(),
        consentGranted,
        responseCode: result.responseCode.toString(),
        responseMessage: result.responseMessage,
        accountStatus: result.accountStatus,
      });

      // Return enhanced response
      const response: AccountStatusResponse = {
        ...result,
        phoneNumber,
        requestId: requestId || randomUUID(),
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      console.error("Account status check failed:", error);
      
      if (error instanceof Error) {
        // Handle validation errors
        if (error.message.includes("Invalid E.164")) {
          return res.status(400).json({ 
            message: "Invalid phone number format. Please use E.164 format (e.g., +1234567890)." 
          });
        }
        
        // Handle EnStream API errors
        if (error.message.includes("HTTP")) {
          return res.status(502).json({ 
            message: "EnStream API is currently unavailable. Please try again later." 
          });
        }
      }
      
      res.status(500).json({ 
        message: "An unexpected error occurred while checking account status." 
      });
    }
  });

  // Get recent queries endpoint
  app.get("/api/recent-queries", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const queries = await storage.getRecentPhoneQueries(limit);
      res.json(queries);
    } catch (error) {
      console.error("Failed to fetch recent queries:", error);
      res.status(500).json({ message: "Failed to fetch recent queries" });
    }
  });

  // Clear query history endpoint
  app.delete("/api/recent-queries", async (req, res) => {
    try {
      await storage.clearPhoneQueryHistory();
      res.json({ message: "Query history cleared successfully" });
    } catch (error) {
      console.error("Failed to clear query history:", error);
      res.status(500).json({ message: "Failed to clear query history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
