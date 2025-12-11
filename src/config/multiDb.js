import mongoose from "mongoose";

// Usamos variables de entorno si existen, si no, localhost
const URI_NORTE =
  process.env.MONGO_URI_NORTE || "mongodb://127.0.0.1:27017/base_norte";
const URI_SUR =
  process.env.MONGO_URI_SUR || "mongodb://127.0.0.1:27017/base_sur";

export const connNorte = mongoose.createConnection(URI_NORTE);
export const connSur = mongoose.createConnection(URI_SUR);

connNorte.on("connected", () => console.log(">>> Conectado a DB NORTE"));
connNorte.on("error", (err) =>
  console.error("❌ Error de conexión en DB NORTE:", err.message)
);

connSur.on("connected", () => console.log(">>> Conectado a DB SUR"));
connSur.on("error", (err) =>
  console.error("❌ Error de conexión en DB SUR:", err.message)
);
