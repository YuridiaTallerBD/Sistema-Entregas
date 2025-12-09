import mongoose from "mongoose";

const pedidoSchema = new mongoose.Schema(
  {
    clienteNombre: { type: String, required: true },
    clienteTelefono: { type: String },
    direccion: { type: String, required: true },
    zona: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zona",
      required: true
    },
    repartidor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repartidor",
      default: null
    },
    estado: {
      type: String,
      enum: ["pendiente", "asignado", "en_camino", "entregado", "cancelado"],
      default: "pendiente"
    },
    notas: { type: String }
  },
  {
    timestamps: true
  }
);

// 👇 ESTA LÍNEA ES LA IMPORTANTE
export default mongoose.model("Pedido", pedidoSchema);
