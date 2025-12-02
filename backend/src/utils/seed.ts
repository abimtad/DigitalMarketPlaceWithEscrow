import { db, initDatabase, Product } from "../models/database.js";
import { v4 as uuidv4 } from "uuid";

export async function seedProducts() {
  await initDatabase();
  await db.read();
  if (!db.data) return;
  if (db.data.products.length > 0) return; // already seeded

  const samples: Omit<Product, "createdAt" | "updatedAt">[] = [
    {
      id: uuidv4(),
      name: "Wireless Headphones",
      description:
        "Noise-cancelling over-ear wireless headphones with 30h battery.",
      price: 0.8,
      seller: "0x0000000000000000000000000000000000000001",
      imageUrl: "",
    },
    {
      id: uuidv4(),
      name: "Mechanical Keyboard",
      description: "Hot-swappable mechanical keyboard with RGB backlight.",
      price: 0.5,
      seller: "0x0000000000000000000000000000000000000002",
      imageUrl: "",
    },
    {
      id: uuidv4(),
      name: "4K Monitor",
      description: "27-inch 4K IPS monitor with HDR support.",
      price: 1.2,
      seller: "0x0000000000000000000000000000000000000003",
      imageUrl: "",
    },
  ];

  samples.forEach((p) =>
    db.data!.products.push({
      ...p,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  );
  await db.write();
  console.log("✅ Seeded sample products");
}
