import express from "express";
import cors from "cors";
import productRoutes from "./routes/products.js";
import disputeRoutes from "./routes/disputes.js";
import arbitrationRoutes from "./routes/arbitration.js";
import notificationRoutes from "./routes/notifications.js";
import { seedProducts } from "./utils/seed.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/arbitration", arbitrationRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, async () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
  try {
    await seedProducts();
  } catch (e) {
    console.error("Seed error:", e);
  }
});
