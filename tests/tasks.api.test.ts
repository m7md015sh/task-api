import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Tasks API — Integration", () => {
  const app = createApp();
  const authHeader = { Authorization: "Bearer stub-token" };

  describe("GET /health/live", () => {
    it("returns 200 ok", async () => {
      const res = await request(app).get("/health/live");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok" });
    });
  });

  describe("Auth middleware", () => {
    it("returns 401 when Authorization header is missing", async () => {
      const res = await request(app).get("/api/v1/tasks");
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });
  });

  describe("Unknown routes", () => {
    it("returns 404 JSON for unknown route", async () => {
      const res = await request(app).get("/api/v99/unknown");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Route not found");
    });
  });

  describe("POST /api/v1/tasks", () => {
    it("creates a task and returns 201 with Location header", async () => {
      const res = await request(app)
        .post("/api/v1/tasks")
        .set(authHeader)
        .send({ title: "Buy milk" });

      expect(res.status).toBe(201);
      expect(res.headers.location).toMatch(/^\/api\/v1\/tasks\/t_/);
      expect(res.body.data).toMatchObject({ title: "Buy milk", done: false });
      expect(res.body.data.ownerId).toBeUndefined();
    });

    it("returns 400 for missing title", async () => {
      const res = await request(app)
        .post("/api/v1/tasks")
        .set(authHeader)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/v1/tasks", () => {
    it("returns list with meta and no ownerId in items", async () => {
      const res = await request(app).get("/api/v1/tasks").set(authHeader);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty("nextCursor");
      for (const item of res.body.data) {
        expect(item.ownerId).toBeUndefined();
      }
    });
  });

  describe("GET /api/v1/tasks/:id", () => {
    it("returns 404 for non-existent task", async () => {
      const res = await request(app)
        .get("/api/v1/tasks/t_nonexistent-id-1234")
        .set(authHeader);

      expect(res.status).toBe(404);
    });
  });
});
