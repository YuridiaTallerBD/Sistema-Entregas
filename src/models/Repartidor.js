// src/models/Repartidor.js
import mongoose from "mongoose";
import { connNorte, connSur } from "../config/db.js";

// 👇 AHORA el esquema SÍ se exporta con nombre
export const repartidorSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    telefono: { type: String },
    vehiculo: { type: String },

    // Zona lógica donde trabaja el repartidor
    zonaCodigo: {
      type: String,
      enum: ["NORTE", "SUR"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Un modelo por cada base de datos
const RepartidorNorte = connNorte.model("Repartidor", repartidorSchema);
const RepartidorSur = connSur.model("Repartidor", repartidorSchema);

// Arreglo que usan tus rutas para decidir a qué BD ir
export const repartidorModelsAll = [
  { codigo: "NORTE", Model: RepartidorNorte },
  { codigo: "SUR", Model: RepartidorSur },
];

// Export default (por si en algún archivo sigues usando "Repartidor" a secas)
export default RepartidorNorte;
