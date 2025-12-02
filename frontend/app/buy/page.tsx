"use client";

import { useEffect, useState } from "react";
import { useContract } from "@/hooks/useContract";
import { productService, Product } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ethers } from "ethers";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";

export default function BuyPage() {
  const { contract, account, isConnected, connectWallet } = useContract();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [gasInfo, setGasInfo] = useState<{
    gas: bigint;
    gasPrice: bigint;
    totalCost: bigint;
  } | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (!account || !contract) return;
        const provider = contract.runner as ethers.BrowserProvider;
        if (!provider) return;
        const bal = await provider.getBalance(account);
        setBalance(bal);
      } catch (e) {
        console.warn("Failed to fetch balance", e);
      }
    };
    fetchBalance();
  }, [account, contract]);

  const formatEth = (value: bigint) => ethers.formatEther(value);

  const parseError = (error: any): string => {
    if (!error) return "Transaction failed";
    if (error.shortMessage) return error.shortMessage;
    const msg: string = error.message || "";
    if (msg.includes("insufficient funds")) {
      return "Insufficient funds: You need enough ETH for product price plus gas.";
    }
    if (msg.includes("Cannot create escrow for yourself"))
      return "You cannot buy your own product.";
    if (msg.includes("Amount must be greater than 0"))
      return "Product price must be greater than 0.";
    return msg.split("(")[0].trim();
  };

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (product: Product) => {
    if (!contract || !account) {
      await connectWallet();
      return;
    }

    if (account.toLowerCase() === product.seller.toLowerCase()) {
      alert("You cannot buy your own product");
      return;
    }

    setCreating(product.id);
    try {
      const amount = ethers.parseEther(product.price.toString());

      // Refresh balance before spending
      try {
        const provider = contract.runner as ethers.BrowserProvider;
        const currentBalance = await provider.getBalance(account);
        setBalance(currentBalance);
        // Estimate gas
        const gas = await contract.createEscrow.estimateGas(
          product.id,
          product.seller,
          { value: amount }
        );
        const gasPrice = await (
          provider as ethers.BrowserProvider
        ).getGasPrice();
        const totalCost = amount + gas * gasPrice;
        setGasInfo({ gas, gasPrice, totalCost });
        if (currentBalance < totalCost) {
          showToast(
            `Insufficient balance. Need ~${formatEth(
              totalCost
            )} ETH (price + gas). Current: ${formatEth(currentBalance)} ETH`,
            "error"
          );
          setCreating(null);
          return;
        }
      } catch (estimateErr) {
        console.warn("Gas estimation failed", estimateErr);
      }

      const tx = await contract.createEscrow(product.id, product.seller, {
        value: amount,
      });
      await tx.wait();
      showToast("Order created successfully!", "success");
      setCreating(null);
    } catch (error: any) {
      console.error("Error creating order:", error);
      showToast(parseError(error) || "Failed to create order", "error");
      setCreating(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 p-8 transition-colors">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Connect Wallet</CardTitle>
              <CardDescription>
                Please connect your MetaMask wallet to browse products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={connectWallet}>Connect MetaMask</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 p-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Browse Products
          </h1>
          <p className="text-gray-600">
            Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
          </p>
          {balance !== null && (
            <p className="text-sm text-gray-500 mt-1">
              Balance: {formatEth(balance)} ETH
              {gasInfo && (
                <span className="ml-2">
                  (Est. total cost: {formatEth(gasInfo.totalCost)} ETH)
                </span>
              )}
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">No products available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-900 mb-4">
                    {product.price} ETH
                  </p>
                  <p className="text-sm text-gray-500">
                    Seller: {product.seller.slice(0, 6)}...
                    {product.seller.slice(-4)}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => createOrder(product)}
                    disabled={creating === product.id}
                    className="w-full"
                  >
                    {creating === product.id ? "Creating Order..." : "Buy Now"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
