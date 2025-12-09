import mongoose from "mongoose";

const zonaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true },
    codigo: { type: String, required: true, unique: true },
    descripcion: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Zona", zonaSchema);
