import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Posts API
  app.get("/api/posts", async (_req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const post = await storage.addPost(req.body);
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.updatePost(id, req.body);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePost(id);
      if (!success) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Album Photos API
  app.get("/api/album-photos", async (_req, res) => {
    try {
      const photos = await storage.getAlbumPhotos();
      res.json(photos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/album-photos", async (req, res) => {
    try {
      const photo = await storage.addAlbumPhoto(req.body);
      res.json(photo);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/album-photos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAlbumPhoto(id);
      if (!success) {
        return res.status(404).json({ error: "Photo not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Users API
  app.get("/api/users", async (_req, res) => {
    try {
      const users = await storage.getAppUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const user = await storage.addAppUser(req.body);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateAppUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const success = await storage.deleteAppUser(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teachers API
  app.get("/api/teachers", async (_req, res) => {
    try {
      const teachers = await storage.getTeachers();
      res.json(teachers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/teachers", async (req, res) => {
    try {
      const teacher = await storage.addTeacher(req.body);
      res.json(teacher);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/teachers/:id", async (req, res) => {
    try {
      const teacher = await storage.updateTeacher(req.params.id, req.body);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      res.json(teacher);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/teachers/:id", async (req, res) => {
    try {
      const success = await storage.deleteTeacher(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Classes API
  app.get("/api/classes", async (_req, res) => {
    try {
      const classes = await storage.getClasses();
      res.json(classes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/classes", async (req, res) => {
    try {
      const cls = await storage.addClass(req.body);
      res.json(cls);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/classes/:id", async (req, res) => {
    try {
      const cls = await storage.updateClass(req.params.id, req.body);
      if (!cls) {
        return res.status(404).json({ error: "Class not found" });
      }
      res.json(cls);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/classes/:id", async (req, res) => {
    try {
      const success = await storage.deleteClass(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Class not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Registered Children API
  app.get("/api/registered-children", async (_req, res) => {
    try {
      const children = await storage.getRegisteredChildren();
      res.json(children);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/registered-children", async (req, res) => {
    try {
      const child = await storage.addRegisteredChild(req.body);
      res.json(child);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/registered-children/:id", async (req, res) => {
    try {
      const child = await storage.updateRegisteredChild(req.params.id, req.body);
      if (!child) {
        return res.status(404).json({ error: "Child not found" });
      }
      res.json(child);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/registered-children/:id", async (req, res) => {
    try {
      const success = await storage.deleteRegisteredChild(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Child not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Site Settings API
  app.get("/api/site-settings", async (_req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.updateSiteSettings(req.body);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
