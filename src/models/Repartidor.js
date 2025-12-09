import mongoose from "mongoose";

const repartidorSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    telefono: { type: String },
    vehiculo: { type: String }, // moto, bici, auto
    zona: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zona",
      required: true
    },
    activo: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Repartidor", repartidorSchema);
