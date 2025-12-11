import express from "express";
import { repartidorModelsAll } from "../models/Repartidor.js";

const router = express.Router();

/**
 * Dado cualquier valor de zona que llegue del front,
 * devuelve el modelo correcto (NORTE / SUR) y el código normalizado.
 */
function getModelZona(valorZonaRaw) {
  if (!valorZonaRaw) return null;

  let codigo = String(valorZonaRaw).trim().toUpperCase();

  // Si viene como "Zona NORTE" o "zona norte", lo limpiamos
  if (codigo.startsWith("ZONA ")) {
    codigo = codigo.replace("ZONA ", "");
  }
  // Si viniera con algo extra, nos quedamos con la primera palabra
  if (codigo.includes(" ")) {
    codigo = codigo.split(" ")[0];
  }

  const entry = repartidorModelsAll.find((r) => r.codigo === codigo);
  if (!entry) return null;

  return { ...entry, codigo };
}

/**
 * CREAR REPARTIDOR
 * POST /api/repartidores
 */
router.post("/", async (req, res) => {
  try {
    const { nombre, telefono, vehiculo } = req.body;
    const zonaRaw = req.body.zonaCodigo || req.body.zona;

    const info = getModelZona(zonaRaw);
    if (!info) {
      return res
        .status(400)
        .json({ error: "Falta especificar zona (NORTE/SUR)" });
    }

    const repartidor = await info.Model.create({
      nombre,
      telefono,
      vehiculo,
      zonaCodigo: info.codigo,
    });

    res.status(201).json(repartidor);
  } catch (error) {
    console.error("Error creando repartidor:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * LISTAR TODOS LOS REPARTIDORES (NORTE + SUR)
 * GET /api/repartidores
 */
router.get("/", async (req, res) => {
  try {
    const resultados = [];

    for (const { codigo, Model } of repartidorModelsAll) {
      const docs = await Model.find().lean();
      docs.forEach((d) => {
        resultados.push({ ...d, zonaCodigo: codigo });
      });
    }

    res.json(resultados);
  } catch (error) {
    console.error("Error listando repartidores:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * FRAGMENTACIÓN HORIZONTAL:
 * LISTAR REPARTIDORES POR ZONA
 * GET /api/repartidores/por-zona/:codigo
 */
router.get("/por-zona/:codigo", async (req, res) => {
  try {
    const info = getModelZona(req.params.codigo);
    if (!info) {
      return res.status(400).json({ error: "Zona inválida (NORTE/SUR)" });
    }

    const docs = await info.Model.find().lean();
    const conZona = docs.map((d) => ({ ...d, zonaCodigo: info.codigo }));
    res.json(conZona);
  } catch (error) {
    console.error("Error listando por zona:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ACTUALIZAR REPARTIDOR
 * PUT /api/repartidores/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, vehiculo } = req.body;
    const zonaRaw = req.body.zonaCodigo || req.body.zona;

    let actualizado = null;

    // Si mandan zona, usamos ese modelo.
    const info = getModelZona(zonaRaw);
    if (info) {
      actualizado = await info.Model.findByIdAndUpdate(
        id,
        { nombre, telefono, vehiculo, zonaCodigo: info.codigo },
        { new: true }
      );
    } else {
      // Si no mandan zona, buscamos en todas las bases
      for (const { Model, codigo } of repartidorModelsAll) {
        actualizado = await Model.findByIdAndUpdate(
          id,
          { nombre, telefono, vehiculo, zonaCodigo: codigo },
          { new: true }
        );
        if (actualizado) break;
      }
    }

    if (!actualizado) {
      return res.status(404).json({ error: "Repartidor no encontrado" });
    }

    res.json(actualizado);
  } catch (error) {
    console.error("Error actualizando repartidor:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ELIMINAR REPARTIDOR
 * DELETE /api/repartidores/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let eliminado = null;
    for (const { Model } of repartidorModelsAll) {
      eliminado = await Model.findByIdAndDelete(id);
      if (eliminado) break;
    }

    if (!eliminado) {
      return res.status(404).json({ error: "Repartidor no encontrado" });
    }

    res.json({ mensaje: "Repartidor eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando repartidor:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
