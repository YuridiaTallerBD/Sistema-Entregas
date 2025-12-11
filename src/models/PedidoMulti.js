// src/models/PedidoMulti.js
import mongoose from "mongoose";
import { connNorte, connSur } from "../config/multiDb.js";

const pedidoSchema = new mongoose.Schema(
  {
    clienteNombre:   { type: String, required: true },
    clienteTelefono: String,
    direccion:       { type: String, required: true },

    // NORTE o SUR
    zonaCodigo: {
      type: String,
      enum: ["NORTE", "SUR"],
      required: true,
    },

    // Guardamos solo el _id del repartidor en la misma BD
    repartidorId: { type: mongoose.Schema.Types.ObjectId, ref: "Repartidor" },

    estado: {
      type: String,
      enum: ["pendiente", "asignado", "en_camino", "entregado", "cancelado"],
      default: "pendiente",
    },

    notas: String,
  },
  { timestamps: true }
);

// Un modelo por base física
export const PedidoNorte = connNorte.model("Pedido", pedidoSchema);
export const PedidoSur   = connSur.model("Pedido", pedidoSchema);

export function getPedidoModelByZona(zonaCodigo) {
  const cod = String(zonaCodigo).toUpperCase();
  if (cod === "NORTE") return PedidoNorte;
  if (cod === "SUR")   return PedidoSur;
  throw new Error("Zona no válida: " + zonaCodigo);
}

export const pedidoModelsAll = [
  { codigo: "NORTE", model: PedidoNorte },
  { codigo: "SUR",   model: PedidoSur },
];
