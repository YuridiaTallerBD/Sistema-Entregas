// src/config/db.js
import mongoose from "mongoose";

// 👇 Usa tu cadena base de Atlas (la que ya funcionaba)
const URI_BASE = "mongodb+srv://Yuri:yuri123@clusterentregas.2j3s6pw.mongodb.net";

// Conexión para la BD de la zona NORTE
export const connNorte = mongoose.createConnection(
  `${URI_BASE}/base_norte?appName=ClusterEntregas`
);

// Conexión para la BD de la zona SUR
export const connSur = mongoose.createConnection(
  `${URI_BASE}/base_sur?appName=ClusterEntregas`
);

// Logs bonitos
connNorte.on("connected", () => {
  console.log("✅ Conectado a BD NORTE");
});
connNorte.on("error", (err) => {
  console.error("❌ Error en BD NORTE:", err);
});

connSur.on("connected", () => {
  console.log("✅ Conectado a BD SUR");
});
connSur.on("error", (err) => {
  console.error("❌ Error en BD SUR:", err);
});

// Esta función la llama server.js
export async function connectDB() {
  console.log("Conexiones NORTE y SUR inicializadas");
}
