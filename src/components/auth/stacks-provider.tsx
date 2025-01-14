"use client";

import React from "react";
import { showConnect, openSignatureRequestPopup } from "@stacks/connect";
import { STACKS_MAINNET } from "@stacks/network";
import { userSession } from "@/lib/userSession";

interface ConnectWalletOptions {
  onCancel: () => void;
}

export function connectWallet({ onCancel }: ConnectWalletOptions) {
  return new Promise((resolve) => {
    showConnect({
      appDetails: {
        name: "AIBTC",
        icon: "https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/aibtcdev/aibtcdev-avatar-250px.png",
      },
      onCancel,
      onFinish: () => {
        const data = userSession.loadUserData();
        resolve(data);
      },
      userSession,
    });
  });
}

export function requestSignature(): Promise<string> {
  return new Promise((resolve, reject) => {
    openSignatureRequestPopup({
      message: "Please sign the message to authenticate.",
      network: STACKS_MAINNET,
      appDetails: {
        name: "AIBTC",
        icon: "https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/aibtcdev/aibtcdev-avatar-250px.png",
      },
      onFinish: (data) => {
        resolve(data.signature.slice(0, 72));
      },
      onCancel: () => {
        reject(new Error("Signature request cancelled"));
      },
    });
  });
}

interface StacksProviderProps {
  children?: React.ReactNode;
}

export default function StacksProvider({ children }: StacksProviderProps) {
  return <>{children}</>;
}
