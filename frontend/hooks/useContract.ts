import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "@/utils/contractAddress";
import EscrowABI from "@/utils/EscrowABI.json";

export function useContract() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    if (typeof window === "undefined" || !window.ethereum) return;
    const initProvider = async () => {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);
        const accounts = await browserProvider.listAccounts();
        if (accounts.length > 0) {
          const signer = await browserProvider.getSigner();
          setSigner(signer);
          setAccount(accounts[0].address);
          setIsConnected(true);
          setContract(new ethers.Contract(CONTRACT_ADDRESS, EscrowABI, signer));
        }
        setInitialized(true);
      } catch (e) {
        console.warn("Provider init failed", e);
      }
    };
    initProvider();

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length > 0) {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await newProvider.getSigner();
        setProvider(newProvider);
        setSigner(signer);
        setAccount(accounts[0]);
        setIsConnected(true);
        setContract(new ethers.Contract(CONTRACT_ADDRESS, EscrowABI, signer));
      } else {
        disconnectWallet();
      }
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, [initialized]);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        setProvider(provider);
        setSigner(signer);
        setAccount(address);
        setIsConnected(true);

        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          EscrowABI,
          signer
        );
        setContract(contract);

        return { success: true, address };
      } catch (error: any) {
        console.error("Error connecting wallet:", error);
        return { success: false, error: error.message };
      }
    } else {
      return { success: false, error: "MetaMask not installed" };
    }
  };

  const disconnectWallet = () => {
    // MetaMask cannot be programmatically force-disconnected; clear local state
    setAccount(null);
    setIsConnected(false);
    setSigner(null);
    setContract(null);
  };

  return {
    provider,
    signer,
    contract,
    account,
    isConnected,
    connectWallet,
    disconnectWallet,
  };
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
