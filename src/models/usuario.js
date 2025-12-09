// src/models/usuario.js
import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    foto: { type: String }
  },
  {
    timestamps: true
  }
);

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;   // 👈 ESTA LÍNEA ES LA CLAVE
