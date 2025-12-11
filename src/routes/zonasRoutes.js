import express from "express";
import Zona from "../models/Zona.js";

const router = express.Router();

/**
 * Crear zona
 * POST /api/zonas
 */
router.post("/", async (req, res) => {
  try {
    const zona = await Zona.create(req.body);
    res.status(201).json(zona);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Listar zonas
 * GET /api/zonas
 */
router.get("/", async (req, res) => {
  try {
    const zonas = await Zona.find();
    res.json(zonas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Actualizar zona
 * PUT /api/zonas/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const actualizada = await Zona.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!actualizada) {
      return res.status(404).json({ error: "Zona no encontrada" });
    }

    res.json(actualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Eliminar zona
 * DELETE /api/zonas/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const eliminada = await Zona.findByIdAndDelete(id);

    if (!eliminada) {
      return res.status(404).json({ error: "Zona no encontrada" });
    }

    res.json({ mensaje: "Zona eliminada correctamente" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
