// server/routes.ts
import type { Express, Request, Response } from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { setupAuth } from "./replitAuth";
import { storage } from "./storage";
import {
  insertProjectSchema,
  insertTemplateSchema,
  insertAnalyticsSchema,
  type User,
} from "@shared/schema";
import OpenAI from "openai";

// --- Extend Express Request type to include `user` ---
declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string; [key: string]: any };
  }
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

interface CodeResponse {
  success: boolean;
  code?: string;
  explanation?: string;
  suggestions?: string[];
  error?: string;
}

// ---------------- Helpers ----------------
function safeJSONParse<T = any>(text: string): T | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}

async function callOpenAI(prompt: string): Promise<CodeResponse> {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 8000,
      temperature: 0.2,
    });
    const rawOutput = completion.choices[0].message?.content ?? "";
    const parsed = safeJSONParse<CodeResponse>(rawOutput);

    if (!parsed) return { success: false, error: "Failed to parse model output" };
    return parsed;
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

// ---------------- OpenAI API ----------------
export async function generateCode(prompt: string): Promise<CodeResponse> {
  return callOpenAI(
    `You are Markod AI, a professional code generator. 
    Generate clean, production-ready code. 
    Respond strictly in this JSON format:
    {
      "success": true,
      "code": "...code here...",
      "explanation": "Explain how this code works."
    }
    User request: ${prompt}`
  );
}

export async function suggestImprovements(code: string): Promise<CodeResponse> {
  return callOpenAI(
    `You are Markod AI, a senior code reviewer. 
    Suggest clear improvements to the given code.
    Respond strictly in this JSON format:
    {
      "success": true,
      "suggestions": ["...", "..."],
      "explanation": "Summarize why these changes matter."
    }
    Code:\n${code}`
  );
}

export async function fixCodeError(code: string, error: string): Promise<CodeResponse> {
  return callOpenAI(
    `You are Markod AI, a debugging expert. 
    Fix the error in the given code and explain the fix.
    Respond strictly in this JSON format:
    {
      "success": true,
      "code": "...corrected code...",
      "explanation": "Explain what was wrong and how it was fixed."
    }
    Code:\n${code}
    Error:\n${error}`
  );
}

// ---------------- Register Routes ----------------
export async function registerRoutes(app: Express) {
  // Set up authentication
  await setupAuth(app);

  // -------- Users --------
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) return res.status(401).json({ message: "Not authenticated" });
      const user = await storage.getUser(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // -------- Projects --------
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) return res.status(400).json({ message: "User ID required" });
      const projects = await storage.getProjectsByUser(userId);
      res.json(projects);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      res.json(project);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.put("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      res.json(project);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // -------- Templates --------
  app.get("/api/templates", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string;
      const templates = await storage.getTemplates(category);
      res.json(templates);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/templates/:id", async (req: Request, res: Response) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) return res.status(404).json({ message: "Template not found" });
      res.json(template);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/templates", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(validatedData);
      res.status(201).json(template);
    } catch {
      res.status(400).json({ message: "Invalid template data" });
    }
  });

  // -------- Analytics --------
  app.get("/api/analytics/user", async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) return res.status(401).json({ message: "Not authenticated" });
      const analytics = await storage.getUserAnalytics(req.user.id);
      res.json(analytics);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/analytics/project/:id", async (req: Request, res: Response) => {
    try {
      const analytics = await storage.getProjectAnalytics(req.params.id);
      res.json(analytics);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/analytics", async (req: Request, res: Response) => {
    try {
      const validatedData = insertAnalyticsSchema.parse(req.body);
      const analytics = await storage.logAnalyticsEvent(validatedData);
      res.status(201).json(analytics);
    } catch {
      res.status(400).json({ message: "Invalid analytics data" });
    }
  });

  // -------- OpenAI Code APIs --------
  app.post("/api/generate-code", async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ message: "Prompt is required" });
      const result = await generateCode(prompt);
      res.json(result);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/suggest-improvements", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      if (!code) return res.status(400).json({ message: "Code is required" });
      const result = await suggestImprovements(code);
      res.json(result);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/fix-code", async (req: Request, res: Response) => {
    try {
      const { code, error } = req.body;
      if (!code || !error) return res.status(400).json({ message: "Code and error are required" });
      const result = await fixCodeError(code, error);
      res.json(result);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // -------- WebSocket --------
  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "join_project") {
          ws.send(JSON.stringify({ type: "joined", projectId: message.projectId }));
        } else if (message.type === "code_change") {
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === client.OPEN) {
              client.send(JSON.stringify({ type: "code_change", data: message.data }));
            }
          });
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
  });

  return server;
}
