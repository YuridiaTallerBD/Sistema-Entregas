import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import passport from "passport";

import { connectDB } from "./config/db.js";
import "./config/passport.js";

import zonasRoutes from "./routes/zonasRoutes.js";
import repartidoresRoutes from "./routes/repartidoresRoutes.js";
import pedidosRoutes from "./routes/pedidosRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Sesiones necesarias para OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecreto",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Archivos estáticos (tu frontend HTML/CSS/JS)
app.use(express.static(path.join(__dirname, "../public")));

connectDB();

// Rutas de autenticación
app.use("/auth", authRoutes);

// Middleware opcional para proteger APIs
function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "No autenticado" });
}

// Rutas API
app.use("/api/zonas", /*ensureAuth,*/ zonasRoutes);
app.use("/api/repartidores", /*ensureAuth,*/ repartidoresRoutes);
app.use("/api/pedidos", /*ensureAuth,*/ pedidosRoutes);

// Página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
