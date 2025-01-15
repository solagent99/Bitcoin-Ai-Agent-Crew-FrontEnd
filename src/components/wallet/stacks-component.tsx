"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BsRobot } from "react-icons/bs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { STACKS_TESTNET, STACKS_MAINNET } from "@stacks/network";
import { openSTXTransfer } from "@stacks/connect";

interface StacksComponentsProps {
  address: string;
  amount: string;
  onAmountChange: (value: string) => void;
  onToast: (
    title: string,
    description?: string,
    variant?: "default" | "destructive"
  ) => void;
}

export default function StacksComponents({
  address,
  amount,
  onAmountChange,
  onToast,
}: StacksComponentsProps) {
  const sendSTX = (recipientAddress: string, amountInSTX: string) => {
    const network =
      process.env.NEXT_PUBLIC_STACKS_NETWORK == "mainnet"
        ? STACKS_MAINNET
        : STACKS_TESTNET;

    openSTXTransfer({
      recipient: recipientAddress,
      amount: amountInSTX,
      memo: "Agent funding",
      network: network,
      onFinish: (data) => {
        const explorerUrl = `https://explorer.stacks.co/txid/${data.txId}`;
        onToast(
          "Success",
          "Transfer sent to agent, funds will arrive soon.",
          "default"
        );
        return {
          txId: data.txId,
          explorerUrl: explorerUrl,
          rawTx: data.txRaw,
        };
      },
      onCancel: () => {
        onToast("Transaction Canceled");
      },
    });
  };

  const handleSendSTX = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      onToast("Please enter a valid STX amount", undefined, "destructive");
      return;
    }
    const microSTX = (Number(amount) * 1_000_000).toString();
    sendSTX(address, microSTX);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="text-zinc-400 hover:text-white">
          <BsRobot className="h-4 w-4 mr-2" />
          Fund Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="relative">
            <Input
              type="string"
              placeholder="Amount in STX"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="pl-2 pr-12"
              min="0"
              step="0.1"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              STX
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSendSTX} className="w-full">
            Confirm Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
