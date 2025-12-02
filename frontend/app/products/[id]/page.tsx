"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useContract } from "@/hooks/useContract";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { productService, Product } from "@/services/api";
import { useToast } from "@/components/ToastProvider";

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const { contract, account } = useContract();
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [estimating, setEstimating] = useState(false);
  const { showToast } = useToast();

  // Always mount hooks in consistent order (first: load product)
  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await productService.getById(id);
        setProduct(data);
      } catch (e) {
        console.error("Failed to load product", e);
      }
    }
    load();
  }, [id]);

  // Balance effect must be before any conditional returns to avoid hook order changes
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

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <p className="text-red-600">Product not found.</p>
      </div>
    );
  }

  const formatEth = (v: bigint) => ethers.formatEther(v);

  const parseError = (error: any): string => {
    if (!error) return "Transaction failed";
    if (error.shortMessage) return error.shortMessage;
    const msg: string = error.message || "";
    if (msg.includes("insufficient funds")) {
      return "Insufficient funds: need price + gas. Fund your wallet.";
    }
    if (msg.includes("Cannot create escrow for yourself"))
      return "You cannot buy your own product.";
    return msg.split("(")[0].trim();
  };

  async function handleBuy() {
    if (!contract || !product || !account) return;
    try {
      const value = ethers.parseEther(product.price.toString());

      // Optional gas / balance check
      setEstimating(true);
      try {
        const provider = contract.runner as ethers.BrowserProvider;
        const currentBalance = await provider.getBalance(account);
        setBalance(currentBalance);

        const gasEstimate = await contract.createEscrow.estimateGas(
          product.id,
          product.seller,
          { value }
        );

        // BrowserProvider (ethers v6) doesn't expose getGasPrice(); use getFeeData()
        const feeData = await provider.getFeeData();
        // Prefer gasPrice, then maxFeePerGas; fallback to 1 gwei to avoid nulls
        const gasUnit =
          feeData.gasPrice ??
          feeData.maxFeePerGas ??
          ethers.parseUnits("1", "gwei");
        const totalCost = value + gasEstimate * gasUnit;

        if (currentBalance < totalCost) {
          showToast(
            `Insufficient balance. Need ~${formatEth(
              totalCost
            )} ETH (price+gas). Have ${formatEth(currentBalance)} ETH`,
            "error"
          );
          setEstimating(false);
          return;
        }
      } catch (estimateErr) {
        console.warn("Gas estimation failed", estimateErr);
        // continue without blocking the purchase
      } finally {
        setEstimating(false);
      }

      setTxStatus("Awaiting wallet signature...");
      const tx = await contract.createEscrow(product.id, product.seller, {
        value,
      });
      setTxStatus("Transaction sent: " + tx.hash);
      const receipt = await tx.wait();
      setTxStatus("Confirmed in block " + receipt.blockNumber);
      showToast("Escrow order created successfully", "success");
    } catch (err: any) {
      const msg = parseError(err);
      setTxStatus(msg);
      showToast(msg, "error");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 px-6 py-12 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="object-cover rounded-lg w-full h-full"
              />
            ) : (
              product.name
            )}
          </div>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xl font-semibold">{product.price} ETH</span>
              {product.imageUrl && (
                <span className="text-xs px-2 py-1 rounded bg-gray-200">
                  Image
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Seller: {product.seller.slice(0, 6)}...{product.seller.slice(-4)}
            </div>
            <div className="space-y-3">
              <Button onClick={handleBuy} disabled={estimating}>
                {estimating ? "Estimating..." : "Buy with Escrow"}
              </Button>
              {balance !== null && (
                <div className="text-xs text-gray-500">
                  Balance: {formatEth(balance)} ETH
                </div>
              )}
              {txStatus && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {txStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
