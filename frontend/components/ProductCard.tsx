"use client";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number | string;
  seller?: string;
  imageUrl?: string;
  compact?: boolean;
  onPrimary?: () => void;
  primaryLabel?: string;
  loading?: boolean;
}

export function ProductCard({
  id,
  name,
  description,
  price,
  seller,
  imageUrl,
  compact,
  onPrimary,
  primaryLabel,
  loading,
}: ProductCardProps) {
  return (
    <Card className={compact ? "h-full" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span>{name}</span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {price} ETH
          </span>
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      {imageUrl && (
        <CardContent className="pt-0">
          <div className="aspect-video rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
            <img
              src={imageUrl}
              alt={name}
              className="object-cover w-full h-full"
            />
          </div>
        </CardContent>
      )}
      <CardFooter className="flex flex-col gap-2">
        <div className="flex w-full justify-between text-xs text-gray-500 dark:text-gray-400">
          {seller && (
            <span>
              Seller: {seller.slice(0, 6)}…{seller.slice(-4)}
            </span>
          )}
          <Link
            className="underline underline-offset-2"
            href={`/products/${id}`}
          >
            Details
          </Link>
        </div>
        {onPrimary && (
          <Button
            onClick={onPrimary}
            disabled={loading}
            className="w-full"
            variant="secondary"
          >
            {loading ? "Processing…" : primaryLabel}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
