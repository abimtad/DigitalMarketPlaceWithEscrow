import { create } from "zustand";
import { productService, Product, disputeService } from "@/services/api";
import { ethers } from "ethers";
import EscrowABI from "@/utils/EscrowABI.json";
import { CONTRACT_ADDRESS, RPC_URL } from "@/utils/contractAddress";

export interface OrderLite {
  orderId: number;
  buyer: string;
  seller: string;
  amountEth: string;
  status: number;
  productId: string;
  disputeOpened: boolean;
}

interface MarketplaceState {
  products: Product[];
  orders: OrderLite[];
  loadingProducts: boolean;
  loadingOrders: boolean;
  loadProducts: () => Promise<void>;
  loadOrders: (account?: string) => Promise<void>;
}

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  products: [],
  orders: [],
  loadingProducts: false,
  loadingOrders: false,
  loadProducts: async () => {
    set({ loadingProducts: true });
    try {
      const data = await productService.getAll();
      set({ products: data });
    } catch (e) {
      console.error("Failed to load products", e);
    } finally {
      set({ loadingProducts: false });
    }
  },
  loadOrders: async (account) => {
    set({ loadingOrders: true });
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        EscrowABI,
        provider
      );
      const count: bigint = await contract.orderCounter();
      const results: OrderLite[] = [];
      for (let i = 1; i <= Number(count); i++) {
        try {
          const o = await contract.getOrder(i);
          const item: OrderLite = {
            orderId: Number(o.orderId),
            buyer: o.buyer,
            seller: o.seller,
            amountEth: ethers.formatEther(o.amount),
            status: Number(o.status),
            productId: o.productId,
            disputeOpened: o.disputeOpened,
          };
          if (
            !account ||
            account.toLowerCase() === item.buyer.toLowerCase() ||
            account.toLowerCase() === item.seller.toLowerCase()
          ) {
            results.push(item);
          }
        } catch {}
      }
      set({ orders: results });
    } catch (e) {
      console.error("Failed to load orders", e);
    } finally {
      set({ loadingOrders: false });
    }
  },
}));
