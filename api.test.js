import { expect } from "chai";
import express from "express";
import request from "supertest";

import authRoutes from "./routes/authRoutes.js";
import flowRoutes from "./routes/flowRoutes.js";
import skinRoutes from "./routes/skinRoutes.js";
import medicationRoutes from "./routes/medicationRoutes.js";
import weightRoutes from "./routes/weightRoutes.js";
import { ensureAuthentication } from "./middleware/authMiddleware.js";

function createTestApp() {
  const app = express();

  app.use(express.json());
  app.use((req, res, next) => {
    req.isAuthenticated = () => false;
    next();
  });

  app.get("/", (req, res) => {
    res.json({ message: "Server is running." });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/flow", ensureAuthentication, flowRoutes);
  app.use("/api/skin", ensureAuthentication, skinRoutes);
  app.use("/api/medication", ensureAuthentication, medicationRoutes);
  app.use("/api/weight", ensureAuthentication, weightRoutes);

  return app;
}

describe("MyPMOSBuddy API", () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe("GET /", () => {
    it("returns a server health message", async () => {
      const res = await request(app).get("/").expect(200);

      expect(res.body).to.deep.equal({ message: "Server is running." });
    });
  });

  describe("GET /api/auth", () => {
    it("returns not logged in when there is no authenticated user", async () => {
      const res = await request(app).get("/api/auth").expect(400);

      expect(res.body).to.deep.equal({ message: "Not logged in" });
    });
  });

  describe("POST /api/auth/register", () => {
    it("requires name, email, and password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@example.com" })
        .expect(400);

      expect(res.body).to.deep.equal({
        message: "Name, email, and password are required",
      });
    });
  });

  describe("protected routes", () => {
    const protectedRoutes = [
      ["GET", "/api/flow"],
      ["POST", "/api/flow"],
      ["PUT", "/api/flow"],
      ["GET", "/api/skin"],
      ["POST", "/api/skin"],
      ["PUT", "/api/skin"],
      ["GET", "/api/skin/routine"],
      ["POST", "/api/skin/routine"],
      ["PUT", "/api/skin/routine"],
      ["GET", "/api/medication"],
      ["POST", "/api/medication"],
      ["DELETE", "/api/medication/507f1f77bcf86cd799439011"],
      ["GET", "/api/weight"],
      ["POST", "/api/weight"],
      ["PUT", "/api/weight"],
    ];

    protectedRoutes.forEach(([method, path]) => {
      it(`${method} ${path} rejects unauthenticated requests`, async () => {
        const res = await request(app)
          [method.toLowerCase()](path)
          .send({})
          .expect(403);

        expect(res.body).to.deep.equal({
          message: "You're not authorized to view this page.",
        });
      });
    });
  });
});
