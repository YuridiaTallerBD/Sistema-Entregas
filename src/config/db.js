import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // 👈 Cargar .env aquí también

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    console.log("🔎 MONGO_URI leído en db.js:", uri);

    if (!uri) {
      throw new Error("MONGO_URI no está definido. Revisa tu archivo .env");
    }

    await mongoose.connect(uri);
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    process.exit(1);
  }
};
