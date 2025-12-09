import express from "express";
import Zona from "../models/Zona.js";

const router = express.Router();

// Crear zona
router.post("/", async (req, res) => {
  try {
    const zona = await Zona.create(req.body);
    res.status(201).json(zona);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar zonas
router.get("/", async (req, res) => {
  try {
    const zonas = await Zona.find();
    res.json(zonas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
