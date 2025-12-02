"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchFilter } from "@/components/SearchFilter";
import { EventsTimeline } from "@/components/EventsTimeline";
import { useState, useEffect } from "react";
import { productService, Product } from "@/services/api";
import { ProductCard } from "@/components/ProductCard";
import { Container } from "@/components/layout/Container";

export default function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await productService.getAll();
        setAllProducts(data);
        setFiltered(data);
      } catch (e) {
        console.error("Failed to load products", e);
      }
    }
    load();
  }, []);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <main className="py-12">
        <div className="space-y-10">
          <section className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Decentralized Marketplace
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Trustless escrow system built on Ethereum. Buy and sell with
              confidence.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/buy">
                <Button size="lg">Browse Products</Button>
              </Link>
              <Link href="/sell">
                <Button size="lg" variant="secondary" className="shadow-sm">
                  Start Selling
                </Button>
              </Link>
            </div>
          </section>

          <section className="space-y-6">
            <Container>
              <SearchFilter onResults={(items) => setFiltered(items as any)} />
            </Container>
            <Container>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    description={p.description}
                    price={p.price}
                    seller={p.seller}
                    imageUrl={p.imageUrl}
                  />
                ))}
              </div>
            </Container>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">Live Escrow Events</h3>
            <Container>
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-white dark:bg-gray-800">
                <EventsTimeline />
              </div>
            </Container>
          </section>
        </div>
      </main>
    </div>
  );
}
