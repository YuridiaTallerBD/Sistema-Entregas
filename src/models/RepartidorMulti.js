import { connNorte, connSur } from "../config/multiDb.js";
import { repartidorSchema } from "./Repartidor.js";

// 1. Creamos el modelo "Repartidor" específico para la base de datos NORTE
const RepartidorNorte = connNorte.model("Repartidor", repartidorSchema);

// 2. Creamos el modelo "Repartidor" específico para la base de datos SUR
const RepartidorSur = connSur.model("Repartidor", repartidorSchema);

// 3. Exportamos una lista con todos (útil para búsquedas globales)
export const repartidorModelsAll = [
  { codigo: "NORTE", model: RepartidorNorte },
  { codigo: "SUR", model: RepartidorSur },
];

// 4. Exportamos la función que pedía el error (Elige DB según la zona)
export function getRepartidorModelByZona(zona) {
  if (!zona) throw new Error("Se requiere indicar la zona (NORTE o SUR).");
  
  const z = zona.toString().toUpperCase();

  if (z === "NORTE") return RepartidorNorte;
  if (z === "SUR") return RepartidorSur;

  throw new Error(`Zona desconocida: "${zona}". Solo se permite NORTE o SUR.`);
}