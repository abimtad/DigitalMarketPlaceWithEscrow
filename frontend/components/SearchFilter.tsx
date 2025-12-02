"use client";
import { useState, useMemo } from "react";
import { products, ProductItem } from "@/data/products";
import { Button } from "@/components/ui/button";

interface Props {
  onResults: (items: ProductItem[]) => void;
}

export function SearchFilter({ onResults }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    []
  );

  function apply() {
    const q = query.toLowerCase();
    const filtered = products.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      const matchesCategory = !category || p.category === category;
      const matchesPrice =
        !maxPrice || parseFloat(p.priceEth) <= parseFloat(maxPrice);
      return matchesQuery && matchesCategory && matchesPrice;
    });
    onResults(filtered);
  }

  return (
    <div className="flex flex-wrap gap-4 items-end bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col">
        <label className="text-xs mb-1">Search</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name or description"
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs mb-1">Max Price (ETH)</label>
        <input
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="e.g. 1.0"
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
        />
      </div>
      <Button variant="secondary" onClick={apply}>
        Apply
      </Button>
    </div>
  );
}
