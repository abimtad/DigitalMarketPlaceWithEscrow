"use client";

import { useContract } from "@/hooks/useContract";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function WalletConnect() {
  const { account, isConnected, connectWallet, disconnectWallet } = useContract();
  const [open, setOpen] = useState(false);

  if (!isConnected || !account) {
    return (
      <Button onClick={connectWallet} variant="default" className="shadow-sm" aria-label="Connect wallet">
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="font-mono text-xs"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        {account.slice(0, 6)}...{account.slice(-4)}
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-2 z-50">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600 dark:text-red-400"
            onClick={() => {
              disconnectWallet();
              setOpen(false);
            }}
          >
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
}
