"use client";

import { useEffect, useState } from "react";
import { useContract } from "@/hooks/useContract";
import { disputeService } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ethers } from "ethers";
import { useToast } from "@/components/ToastProvider";

interface Order {
  orderId: number;
  buyer: string;
  seller: string;
  amount: string;
  status: number;
  productId: string;
  disputeOpened: boolean;
  disputeReason: string;
}

export default function DisputesPage() {
  const { contract, account, isConnected, connectWallet } = useContract();
  const [disputedOrders, setDisputedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [disputeForm, setDisputeForm] = useState<{
    orderId: number;
    reason: string;
  } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // Check for orderId in URL params
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get("orderId");
      if (orderId && !disputeForm) {
        setDisputeForm({ orderId: parseInt(orderId), reason: "" });
      }
    }
  }, []);

  useEffect(() => {
    if (isConnected && contract && account) {
      loadDisputedOrders();
      checkAdmin();
    }
  }, [isConnected, contract, account]);

  const checkAdmin = async () => {
    if (!contract) return;
    try {
      const admin = await contract.admin();
      setIsAdmin(admin.toLowerCase() === account?.toLowerCase());
    } catch (error) {
      console.error("Error checking admin:", error);
    }
  };

  const loadDisputedOrders = async () => {
    if (!contract) return;

    try {
      const orderCount = await contract.orderCounter();
      const allOrders: Order[] = [];

      for (let i = 1; i <= orderCount; i++) {
        try {
          const order = await contract.getOrder(i);
          if (order.disputeOpened || Number(order.status) === 5) {
            allOrders.push({
              orderId: Number(order.orderId),
              buyer: order.buyer,
              seller: order.seller,
              amount: ethers.formatEther(order.amount),
              status: Number(order.status),
              productId: order.productId,
              disputeOpened: order.disputeOpened,
              disputeReason: order.disputeReason,
            });
          }
        } catch (error) {
          // Order doesn't exist, skip
        }
      }

      setDisputedOrders(allOrders);
    } catch (error) {
      console.error("Error loading disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDispute = async (orderId: number, reason: string) => {
    if (!contract) return;

    try {
      const tx = await contract.openDispute(orderId, reason);
      await tx.wait();

      // Create dispute in backend
      try {
        const order = await contract.getOrder(orderId);
        await disputeService.create({
          orderId,
          buyer: order.buyer,
          seller: order.seller,
          reason,
        });
      } catch (error) {
        console.error("Error creating dispute in backend:", error);
      }

      showToast("Dispute opened successfully!", "success");
      setDisputeForm(null);
      await loadDisputedOrders();
    } catch (error: any) {
      console.error("Error opening dispute:", error);
      showToast(error.message || "Failed to open dispute", "error");
    }
  };

  const resolveDispute = async (orderId: number, winner: string) => {
    if (!contract || !isAdmin) return;

    try {
      const tx = await contract.resolveDispute(orderId, winner);
      await tx.wait();
      showToast("Dispute resolved successfully!", "success");
      await loadDisputedOrders();
    } catch (error: any) {
      console.error("Error resolving dispute:", error);
      showToast(error.message || "Failed to resolve dispute", "error");
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 p-8 transition-colors">
        <div className="max-w-4xl mx-auto">
          <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Connect Wallet</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Please connect your MetaMask wallet to view disputes
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Disputes {isAdmin && "(Admin Panel)"}
        </h1>

        {disputeForm && (
          <Card className="mb-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">
                Open Dispute for Order #{disputeForm.orderId}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                placeholder="Reason for dispute..."
                value={disputeForm.reason}
                onChange={(e) =>
                  setDisputeForm({ ...disputeForm, reason: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    openDispute(disputeForm.orderId, disputeForm.reason)
                  }
                  disabled={!disputeForm.reason.trim()}
                >
                  Submit Dispute
                </Button>
                <Button variant="outline" onClick={() => setDisputeForm(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">Loading disputes...</div>
        ) : disputedOrders.length === 0 ? (
          <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="py-12 text-center text-gray-600 dark:text-gray-400">
              No disputes found
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {disputedOrders.map((order) => (
              <Card key={order.orderId} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Dispute for Order #{order.orderId}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Product: {order.productId} | Amount: {order.amount} ETH
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Buyer:</span {" "}
                      {order.buyer.slice(0, 6)}...{order.buyer.slice(-4)}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Seller:</span {" "}
                      {order.seller.slice(0, 6)}...{order.seller.slice(-4)}
                    </p>
                    {order.disputeReason && (
                      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <p className="text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                          Dispute Reason:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {order.disputeReason}
                        </p>
                      </div>
                    )}
                  </div>
                  {isAdmin && order.status === 5 && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() =>
                          resolveDispute(order.orderId, order.buyer)
                        }
                        variant="default"
                      >
                        Award to Buyer
                      </Button>
                      <Button
                        onClick={() =>
                          resolveDispute(order.orderId, order.seller)
                        }
                        variant="outline"
                      >
                        Award to Seller
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
