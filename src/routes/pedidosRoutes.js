import express from "express";
import Pedido from "../models/Pedido.js";

const router = express.Router();

// Crear pedido
router.post("/", async (req, res) => {
  try {
    const pedido = await Pedido.create(req.body);
    res.status(201).json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar todos los pedidos
router.get("/", async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate("zona")
      .populate("repartidor");
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Obtener un pedido por id (opcional pero útil)
router.get("/:id", async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate("zona")
      .populate("repartidor");

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Asignar un pedido a un repartidor
router.put("/:id/asignar", async (req, res) => {
  try {
    const { repartidorId } = req.body;

    if (!repartidorId) {
      return res.status(400).json({ error: "repartidorId es requerido" });
    }

    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      {
        repartidor: repartidorId,
        estado: "asignado"
      },
      { new: true }
    )
      .populate("zona")
      .populate("repartidor");

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Cambiar estado del pedido
router.put("/:id/estado", async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = [
      "pendiente",
      "asignado",
      "en_camino",
      "entregado",
      "cancelado"
    ];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: `Estado inválido. Usa uno de: ${estadosValidos.join(", ")}`
      });
    }

    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    )
      .populate("zona")
      .populate("repartidor");

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
