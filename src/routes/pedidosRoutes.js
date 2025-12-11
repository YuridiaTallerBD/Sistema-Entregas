import express from "express";
import {
  getPedidoModelByZona,
  pedidoModelsAll,
} from "../models/PedidoMulti.js";
import { getRepartidorModelByZona } from "../models/RepartidorMulti.js";

const router = express.Router();

// Nombre bonito para mostrar la zona
const NOMBRES_ZONA = {
  NORTE: "Zona NORTE",
  SUR: "Zona SUR",
};

// Helper: adjunta info de zona y nombre de repartidor (si se conoce)
function attachZonaYRepartidor(pedido, codigoZona, repartidorNombre = null) {
  const plain = pedido.toObject ? pedido.toObject() : pedido;
  const cod = (codigoZona || plain.zonaCodigo || "").toUpperCase();

  return {
    ...plain,
    zonaCodigo: cod,
    zona: {
      codigo: cod,
      nombre: NOMBRES_ZONA[cod] || cod,
    },
    repartidorNombre: repartidorNombre || null,
  };
}

// Helper: buscar pedido en NORTE o SUR
async function findPedidoEnTodas(id) {
  for (const { codigo, model } of pedidoModelsAll) {
    const ped = await model.findById(id);
    if (ped) return { codigo, model, ped };
  }
  return null;
}

// Helper: buscar repartidor en NORTE o SUR (independiente de la zona)
async function findRepartidorEnTodas(repartidorId) {
  const zonas = ["NORTE", "SUR"];

  for (const codigo of zonas) {
    const RepModel = getRepartidorModelByZona(codigo);
    if (!RepModel) continue;

    const rep = await RepModel.findById(repartidorId);
    if (rep) {
      return { codigo, rep };
    }
  }

  return null;
}

/**
 * Crear pedido
 * POST /api/pedidos
 * Body:
 *  - clienteNombre (obligatorio)
 *  - direccion (obligatorio)
 *  - zonaCodigo: "NORTE" | "SUR" (obligatorio)
 *  - clienteTelefono, notas, estado (opcionales)
 */
router.post("/", async (req, res) => {
  try {
    let { zonaCodigo } = req.body;
    const {
      clienteNombre,
      clienteTelefono,
      direccion,
      notas,
      estado,
    } = req.body;

    if (!clienteNombre || !direccion || !zonaCodigo) {
      return res.status(400).json({
        error:
          "clienteNombre, direccion y zonaCodigo (NORTE/SUR) son obligatorios",
      });
    }

    const cod = String(zonaCodigo).toUpperCase();
    const PedidoModel = getPedidoModelByZona(cod);

    const pedido = await PedidoModel.create({
      clienteNombre,
      clienteTelefono,
      direccion,
      zonaCodigo: cod,
      notas,
      estado,
    });

    res.status(201).json(attachZonaYRepartidor(pedido, cod));
  } catch (error) {
    console.error("Error creando pedido:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Listar TODOS los pedidos (NORTE + SUR)
 * GET /api/pedidos
 */
router.get("/", async (req, res) => {
  try {
    const resultados = await Promise.all(
      pedidoModelsAll.map(async ({ codigo, model }) => {
        const pedidos = await model.find().lean();

        // Traemos los repartidores de esa misma zona para saber sus nombres
        const RepModel = getRepartidorModelByZona(codigo);
        const idsRep = pedidos
          .map((p) => p.repartidorId)
          .filter(Boolean)
          .map((id) => id.toString());

        let mapaReps = {};
        if (idsRep.length && RepModel) {
          const reps = await RepModel.find({ _id: { $in: idsRep } }).lean();
          mapaReps = Object.fromEntries(
            reps.map((r) => [r._id.toString(), r.nombre])
          );
        }

        return pedidos.map((p) =>
          attachZonaYRepartidor(
            p,
            codigo,
            p.repartidorId ? mapaReps[p.repartidorId.toString()] || null : null
          )
        );
      })
    );

    const todos = resultados.flat();
    res.json(todos);
  } catch (error) {
    console.error("Error listando pedidos:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Listar pedidos por zona (NORTE o SUR)
 * GET /api/pedidos/por-zona/:codigoZona
 */
router.get("/por-zona/:codigoZona", async (req, res) => {
  try {
    const codigo = req.params.codigoZona.toUpperCase();
    const Model = getPedidoModelByZona(codigo);
    const pedidos = await Model.find().lean();

    const RepModel = getRepartidorModelByZona(codigo);
    const idsRep = pedidos
      .map((p) => p.repartidorId)
      .filter(Boolean)
      .map((id) => id.toString());

    let mapaReps = {};
    if (idsRep.length && RepModel) {
      const reps = await RepModel.find({ _id: { $in: idsRep } }).lean();
      mapaReps = Object.fromEntries(
        reps.map((r) => [r._id.toString(), r.nombre])
      );
    }

    const resp = pedidos.map((p) =>
      attachZonaYRepartidor(
        p,
        codigo,
        p.repartidorId ? mapaReps[p.repartidorId.toString()] || null : null
      )
    );

    res.json(resp);
  } catch (error) {
    console.error("Error listando pedidos por zona:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Obtener un pedido
 * GET /api/pedidos/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const found = await findPedidoEnTodas(id);
    if (!found) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    const { codigo, ped } = found;

    // nombre de repartidor si está asignado
    let repartidorNombre = null;
    if (ped.repartidorId) {
      const RepModel = getRepartidorModelByZona(codigo);
      if (RepModel) {
        const rep = await RepModel.findById(ped.repartidorId);
        if (rep) repartidorNombre = rep.nombre;
      }
    }

    res.json(attachZonaYRepartidor(ped, codigo, repartidorNombre));
  } catch (error) {
    console.error("Error obteniendo pedido:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Actualizar pedido (sin cambiar de zona)
 * PUT /api/pedidos/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const found = await findPedidoEnTodas(id);
    if (!found) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    const { codigo, ped } = found;
    const {
      clienteNombre,
      clienteTelefono,
      direccion,
      notas,
      estado,
    } = req.body;

    if (clienteNombre !== undefined) ped.clienteNombre = clienteNombre;
    if (clienteTelefono !== undefined) ped.clienteTelefono = clienteTelefono;
    if (direccion !== undefined) ped.direccion = direccion;
    if (notas !== undefined) ped.notas = notas;
    if (estado !== undefined) ped.estado = estado;

    await ped.save();

    // opcional: buscar nombre de repartidor
    let repartidorNombre = null;
    if (ped.repartidorId) {
      const RepModel = getRepartidorModelByZona(codigo);
      if (RepModel) {
        const rep = await RepModel.findById(ped.repartidorId);
        if (rep) repartidorNombre = rep.nombre;
      }
    }

    res.json(attachZonaYRepartidor(ped, codigo, repartidorNombre));
  } catch (error) {
    console.error("Error actualizando pedido:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Eliminar pedido
 * DELETE /api/pedidos/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let eliminado = false;
    for (const { model } of pedidoModelsAll) {
      const ped = await model.findByIdAndDelete(id);
      if (ped) {
        eliminado = true;
        break;
      }
    }

    if (!eliminado) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.json({ mensaje: "Pedido eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando pedido:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Asignar repartidor a un pedido
 * PUT /api/pedidos/:id/asignar
 * Body: { repartidorId }
 */
router.put("/:id/asignar", async (req, res) => {
  try {
    const { id } = req.params;
    const { repartidorId } = req.body;

    if (!repartidorId) {
      return res.status(400).json({ error: "Falta repartidorId" });
    }

    // 1. Buscar el pedido en NORTE o SUR
    const found = await findPedidoEnTodas(id);
    if (!found) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    const { codigo: codigoPedido, ped } = found;

    // 2. Buscar el repartidor en NORTE o SUR
    const foundRep = await findRepartidorEnTodas(repartidorId);
    if (!foundRep) {
      return res
        .status(400)
        .json({ error: "Repartidor no encontrado en ninguna zona" });
    }
    const { codigo: codigoRep, rep } = foundRep;

    // 3. Validar que las zonas coincidan
    if (codigoPedido && codigoRep && codigoPedido !== codigoRep) {
      return res
        .status(400)
        .json({ error: "Repartidor no válido para esa zona" });
    }

    // 4. Guardar asignación
    ped.repartidorId = rep._id;
    ped.estado = "asignado";
    await ped.save();

    res.json(attachZonaYRepartidor(ped, codigoPedido, rep.nombre));
  } catch (error) {
    console.error("Error asignando repartidor:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Cambiar estado de un pedido
 * PUT /api/pedidos/:id/estado
 * Body: { estado }
 */
router.put("/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const found = await findPedidoEnTodas(id);
    if (!found) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    const { codigo, ped } = found;
    ped.estado = estado;
    await ped.save();

    // nombre repartidor
    let repartidorNombre = null;
    if (ped.repartidorId) {
      const RepModel = getRepartidorModelByZona(codigo);
      if (RepModel) {
        const rep = await RepModel.findById(ped.repartidorId);
        if (rep) repartidorNombre = rep.nombre;
      }
    }

    res.json(attachZonaYRepartidor(ped, codigo, repartidorNombre));
  } catch (error) {
    console.error("Error cambiando estado:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
