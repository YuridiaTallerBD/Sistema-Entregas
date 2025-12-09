import express from "express";
import Repartidor from "../models/Repartidor.js";

const router = express.Router();

// Crear repartidor
router.post("/", async (req, res) => {
  try {
    const repartidor = await Repartidor.create(req.body);
    res.status(201).json(repartidor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar repartidores
router.get("/", async (req, res) => {
  try {
    const repartidores = await Repartidor.find().populate("zona");
    res.json(repartidores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👇 ESTA LÍNEA ES CLAVE
export default router;
