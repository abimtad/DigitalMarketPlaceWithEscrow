"use client";

import { useEffect, useState } from "react";
import { useContract } from "@/hooks/useContract";
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
}

const STATUS_MAP: Record<number, string> = {
  0: "PENDING",
  1: "SELLER_ACCEPTED",
  2: "SHIPPED",
  3: "DELIVERED",
  4: "COMPLETE",
  5: "DISPUTE",
  6: "RESOLVED",
};

export default function DashboardPage() {
  const { contract, account, isConnected, connectWallet } = useContract();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isConnected && contract && account) {
      loadOrders();
    }
  }, [isConnected, contract, account]);

  const loadOrders = async () => {
    if (!contract) return;

    try {
      const orderCount = await contract.orderCounter();
      const allOrders: Order[] = [];

      for (let i = 1; i <= orderCount; i++) {
        try {
          const order = await contract.getOrder(i);
          if (
            order.buyer.toLowerCase() === account?.toLowerCase() ||
            order.seller.toLowerCase() === account?.toLowerCase()
          ) {
            allOrders.push({
              orderId: Number(order.orderId),
              buyer: order.buyer,
              seller: order.seller,
              amount: ethers.formatEther(order.amount),
              status: Number(order.status),
              productId: order.productId,
              disputeOpened: order.disputeOpened,
            });
          }
        } catch (error) {
          // Order doesn't exist, skip
        }
      }

      setOrders(allOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, orderId: number) => {
    if (!contract) return;

    setActionLoading(orderId);
    try {
      let tx;
      switch (action) {
        case "accept":
          tx = await contract.acceptOrder(orderId);
          break;
        case "ship":
          tx = await contract.markShipped(orderId);
          break;
        case "confirm":
          tx = await contract.confirmDelivery(orderId);
          break;
        case "release":
          tx = await contract.releaseFunds(orderId);
          break;
        default:
          return;
      }
      await tx.wait();
      await loadOrders();
      showToast("Action completed successfully!", "success");
    } catch (error: any) {
      console.error("Error performing action:", error);
      showToast(error.message || "Failed to perform action", "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">
                Connect Wallet
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Please connect your MetaMask wallet to view your dashboard
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

  const buyerOrders = orders.filter(
    (o) => o.buyer.toLowerCase() === account?.toLowerCase()
  );
  const sellerOrders = orders.filter(
    (o) => o.seller.toLowerCase() === account?.toLowerCase()
  );

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Dashboard - {account?.slice(0, 6)}...{account?.slice(-4)}
        </h1>

        {loading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Orders as Buyer
              </h2>
              {buyerOrders.length === 0 ? (
                <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                  <CardContent className="py-8 text-center text-gray-600 dark:text-gray-400">
                    No orders as buyer
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {buyerOrders.map((order) => (
                    <Card
                      key={order.orderId}
                      className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
                    >
                      <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-gray-100">
                          Order #{order.orderId}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Product: {order.productId} | Status:{" "}
                          {STATUS_MAP[order.status]}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                          {order.amount} ETH
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Seller: {order.seller.slice(0, 6)}...
                          {order.seller.slice(-4)}
                        </p>
                        {order.status === 2 && !order.disputeOpened && (
                          <div className="mt-4 space-x-2">
                            <Button
                              onClick={() =>
                                handleAction("confirm", order.orderId)
                              }
                              disabled={actionLoading === order.orderId}
                            >
                              Confirm Delivery
                            </Button>
                            <Button
                              onClick={() => {
                                window.location.href = `/disputes?orderId=${order.orderId}`;
                              }}
                              variant="outline"
                            >
                              Open Dispute
                            </Button>
                          </div>
                        )}
                        {order.status === 1 && !order.disputeOpened && (
                          <div className="mt-4">
                            <Button
                              onClick={() => {
                                window.location.href = `/disputes?orderId=${order.orderId}`;
                              }}
                              variant="outline"
                            >
                              Open Dispute
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Orders as Seller
              </h2>
              {sellerOrders.length === 0 ? (
                <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                  <CardContent className="py-8 text-center text-gray-600 dark:text-gray-400">
                    No orders as seller
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sellerOrders.map((order) => (
                    <Card
                      key={order.orderId}
                      className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
                    >
                      <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-gray-100">
                          Order #{order.orderId}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Product: {order.productId} | Status:{" "}
                          {STATUS_MAP[order.status]}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                          {order.amount} ETH
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Buyer: {order.buyer.slice(0, 6)}...
                          {order.buyer.slice(-4)}
                        </p>
                        <div className="mt-4 space-x-2">
                          {order.status === 0 && (
                            <Button
                              onClick={() =>
                                handleAction("accept", order.orderId)
                              }
                              disabled={actionLoading === order.orderId}
                            >
                              Accept Order
                            </Button>
                          )}
                          {order.status === 1 && (
                            <Button
                              onClick={() =>
                                handleAction("ship", order.orderId)
                              }
                              disabled={actionLoading === order.orderId}
                            >
                              Mark as Shipped
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
