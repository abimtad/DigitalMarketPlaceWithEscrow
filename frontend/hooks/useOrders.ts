"use client";
import { useEffect } from "react";
import { useMarketplaceStore } from "@/store/useMarketplaceStore";
import { useContract } from "./useContract";

export function useOrders(scope: "all" | "mine" = "mine") {
  const { account } = useContract();
  const { orders, loadOrders, loadingOrders } = useMarketplaceStore(
    (state) => ({
      orders: state.orders,
      loadOrders: state.loadOrders,
      loadingOrders: state.loadingOrders,
    })
  );

  useEffect(() => {
    if (scope === "mine") {
      if (account) loadOrders(account);
    } else {
      loadOrders();
    }
  }, [account, scope, loadOrders]);

  return { orders, loadingOrders };
}
