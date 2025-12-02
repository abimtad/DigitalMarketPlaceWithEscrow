"use client";
import { Button } from "@/components/ui/button";
import { useContract } from "@/hooks/useContract";
import { ethers } from "ethers";
import { useState } from "react";

interface Props {
  orderId: number;
  status: number; // enum index
  buyer: string;
  seller: string;
  disputeOpened: boolean;
  onComplete?: () => void;
}

const STATUS = {
  PENDING: 0,
  SELLER_ACCEPTED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  COMPLETE: 4,
  DISPUTE: 5,
  RESOLVED: 6,
};

export function OrderActions({
  orderId,
  status,
  buyer,
  seller,
  disputeOpened,
  onComplete,
}: Props) {
  const { contract, account } = useContract();
  const [loading, setLoading] = useState<string | null>(null);
  const [gasEstimate, setGasEstimate] = useState<string>("");
  const isBuyer = account?.toLowerCase() === buyer.toLowerCase();
  const isSeller = account?.toLowerCase() === seller.toLowerCase();
  const canDispute =
    isBuyer &&
    !disputeOpened &&
    (status === STATUS.SELLER_ACCEPTED || status === STATUS.SHIPPED);

  async function estimate(fn: string) {
    if (!contract) return;
    try {
      let est: bigint;
      switch (fn) {
        case "acceptOrder":
          est = await contract.acceptOrder.estimateGas(orderId);
          break;
        case "markShipped":
          est = await contract.markShipped.estimateGas(orderId);
          break;
        case "confirmDelivery":
          est = await contract.confirmDelivery.estimateGas(orderId);
          break;
        case "releaseFunds":
          est = await contract.releaseFunds.estimateGas(orderId);
          break;
        case "openDispute":
          est = await contract.openDispute.estimateGas(orderId, "Reason");
          break;
        default:
          return;
      }
      setGasEstimate(ethers.formatEther(est * 10n ** 9n)); // naive formatting
    } catch (e) {
      setGasEstimate("");
    }
  }

  async function run(action: string) {
    if (!contract) return;
    setLoading(action);
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
        case "dispute":
          tx = await contract.openDispute(orderId, "Product issue");
          break;
        default:
          return;
      }
      await tx.wait();
      if (onComplete) onComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
      setGasEstimate("");
    }
  }

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      {isSeller && status === STATUS.PENDING && (
        <Button
          onClick={() => run("accept")}
          onMouseEnter={() => estimate("acceptOrder")}
          disabled={!!loading}
        >
          Accept
        </Button>
      )}
      {isSeller && status === STATUS.SELLER_ACCEPTED && (
        <Button
          onClick={() => run("ship")}
          onMouseEnter={() => estimate("markShipped")}
          disabled={!!loading}
        >
          Mark Shipped
        </Button>
      )}
      {isBuyer && status === STATUS.SHIPPED && !disputeOpened && (
        <Button
          onClick={() => run("confirm")}
          onMouseEnter={() => estimate("confirmDelivery")}
          disabled={!!loading}
        >
          Confirm Delivery
        </Button>
      )}
      {isBuyer &&
        (status === STATUS.SHIPPED || status === STATUS.DELIVERED) &&
        !disputeOpened && (
          <Button
            variant="outline"
            onClick={() => run("release")}
            onMouseEnter={() => estimate("releaseFunds")}
            disabled={!!loading}
          >
            Release Funds
          </Button>
        )}
      {canDispute && (
        <Button
          variant="destructive"
          onClick={() => run("dispute")}
          onMouseEnter={() => estimate("openDispute")}
          disabled={!!loading}
        >
          Open Dispute
        </Button>
      )}
      {gasEstimate && (
        <span className="text-xs text-gray-500">
          Est Gas (rough): {gasEstimate} ETH
        </span>
      )}
    </div>
  );
}
