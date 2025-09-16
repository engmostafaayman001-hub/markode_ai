import {
  users,
  projects,
  templates,
  collaborators,
  analytics,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Template,
  type InsertTemplate,
  type Collaborator,
  type InsertCollaborator,
  type Analytics,
  type InsertAnalytics,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;

  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  searchProjects(query: string, userId?: string): Promise<Project[]>;

  // Template operations
  getTemplates(category?: string): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  incrementTemplateDownloads(id: string): Promise<void>;

  // Collaboration operations
  addCollaborator(collaborator: InsertCollaborator): Promise<Collaborator>;
  getProjectCollaborators(projectId: string): Promise<Collaborator[]>;
  removeCollaborator(projectId: string, userId: string): Promise<void>;

  // Analytics operations
  logAnalyticsEvent(event: InsertAnalytics): Promise<Analytics>;
  getProjectAnalytics(projectId: string): Promise<Analytics[]>;
  getUserAnalytics(userId: string): Promise<Analytics[]>;
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

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async searchProjects(query: string, userId?: string): Promise<Project[]> {
    const conditions = [
      or(
        ilike(projects.name, `%${query}%`),
        ilike(projects.description, `%${query}%`)
      )
    ];

    if (userId) {
      conditions.push(eq(projects.userId, userId));
    } else {
      conditions.push(eq(projects.isPublic, true));
    }

    return await db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(desc(projects.updatedAt));
  }

  // Template operations
  async getTemplates(category?: string): Promise<Template[]> {
    const query = db.select().from(templates);
    
    if (category) {
      return await query.where(eq(templates.category, category)).orderBy(desc(templates.downloads));
    }
    
    return await query.orderBy(desc(templates.downloads));
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db.insert(templates).values(template).returning();
    return newTemplate;
  }

  async incrementTemplateDownloads(id: string): Promise<void> {
    await db
      .update(templates)
      .set({ downloads: sql`downloads + 1` })
      .where(eq(templates.id, id));
  }

  // Collaboration operations
  async addCollaborator(collaborator: InsertCollaborator): Promise<Collaborator> {
    const [newCollaborator] = await db.insert(collaborators).values(collaborator).returning();
    return newCollaborator;
  }

  async getProjectCollaborators(projectId: string): Promise<Collaborator[]> {
    return await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.projectId, projectId));
  }

  async removeCollaborator(projectId: string, userId: string): Promise<void> {
    await db
      .delete(collaborators)
      .where(and(eq(collaborators.projectId, projectId), eq(collaborators.userId, userId)));
  }

  // Analytics operations
  async logAnalyticsEvent(event: InsertAnalytics): Promise<Analytics> {
    const [newEvent] = await db.insert(analytics).values(event).returning();
    return newEvent;
  }

  async getProjectAnalytics(projectId: string): Promise<Analytics[]> {
    return await db
      .select()
      .from(analytics)
      .where(eq(analytics.projectId, projectId))
      .orderBy(desc(analytics.createdAt));
  }

  async getUserAnalytics(userId: string): Promise<Analytics[]> {
    return await db
      .select({
        id: analytics.id,
        projectId: analytics.projectId,
        event: analytics.event,
        metadata: analytics.metadata,
        createdAt: analytics.createdAt,
      })
      .from(analytics)
      .innerJoin(projects, eq(analytics.projectId, projects.id))
      .where(eq(projects.userId, userId))
      .orderBy(desc(analytics.createdAt));
  }
}

export const storage = new DatabaseStorage();
