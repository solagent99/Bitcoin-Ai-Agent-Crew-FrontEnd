"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, Check, X, Wallet as WalletIcon } from "lucide-react";
import { useWalletStore } from "@/store/wallet";
import { useSessionStore } from "@/store/session";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNextStep } from "nextstepjs";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";
import type { Wallet, Agent } from "@/types/supabase";

interface WalletWithAgent extends Wallet {
  agent?: Agent;
}

// Dynamically import Stacks components with ssr: false
const StacksComponents = dynamic(() => import("./stacks-component"), {
  ssr: false,
});

interface WalletPanelProps {
  onClose?: () => void;
}

export function WalletPanel({ onClose }: WalletPanelProps) {
  const { balances, userWallet, agentWallets, isLoading, error, fetchWallets } =
    useWalletStore();
  const { userId } = useSessionStore();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [stxAmounts, setStxAmounts] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const truncateAddress = (address: string) => {
    if (!address) return "";
    if (address.length <= 10) return address;
    return `${address.slice(0, 5)}...${address.slice(-5)}`;
  };

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      toast({
        title: `error: ${error}`,
        description: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWallets(userId);
    }
  }, [userId, fetchWallets]);

  const formatBalance = (balance: string) => {
    return (Number(balance) / 1_000_000).toFixed(6);
  };

  const activeAgentWallets = agentWallets.filter(
    (wallet) => !wallet.agent?.is_archived
  );

  const { startNextStep } = useNextStep();

  const handleStartMainTour = () => {
    startNextStep("mainTour");
  };

  const handleAmountChange = (address: string, value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setStxAmounts((prev) => ({ ...prev, [address]: value }));
    }
  };

  const getWalletAddress = (wallet: WalletWithAgent) => {
    return process.env.NEXT_PUBLIC_STACKS_NETWORK === "mainnet"
      ? wallet.mainnet_address
      : wallet.testnet_address;
  };

  return (
    <div className="h-full flex flex-col w-full md:max-w-sm">
      <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-800/50">
        <h2 className="text-lg font-medium text-white">Wallets</h2>
        <Button onClick={handleStartMainTour}>Start Tour</Button>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-zinc-400 md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="text-sm text-zinc-400">Loading balances...</div>
          ) : error ? (
            <div className="text-sm text-red-400">{error}</div>
          ) : (
            <>
              {userWallet && (
                <div
                  className="bg-zinc-800/50 rounded-lg p-4 space-y-3"
                  id="step5"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex items-center justify-center bg-zinc-900 rounded-full border border-zinc-800/40">
                      <WalletIcon className="h-4 w-4 text-zinc-500" />
                    </div>
                    <span className="text-sm font-medium text-white">
                      My Wallet
                    </span>
                  </div>
                  {getWalletAddress(userWallet) ? (
                    <button
                      onClick={() =>
                        copyToClipboard(getWalletAddress(userWallet))
                      }
                      className="w-full flex items-center justify-between text-xs text-zinc-500 font-mono hover:text-zinc-300 transition-colors group"
                    >
                      <span>
                        {truncateAddress(getWalletAddress(userWallet))}
                      </span>
                      <span className="text-zinc-600 group-hover:text-zinc-400">
                        {copiedAddress === getWalletAddress(userWallet) ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </span>
                    </button>
                  ) : (
                    <div className="text-xs text-zinc-500 font-mono">
                      No wallet address
                    </div>
                  )}

                  {getWalletAddress(userWallet) &&
                    balances[getWalletAddress(userWallet)] && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-sm text-zinc-400 min-w-[80px]">
                            STX Balance
                          </span>
                          <span className="text-white font-medium text-right">
                            {formatBalance(
                              balances[getWalletAddress(userWallet)].stx.balance
                            )}{" "}
                            STX
                          </span>
                        </div>

                        {Object.entries(
                          balances[getWalletAddress(userWallet)].fungible_tokens
                        ).map(([tokenId, token]) => {
                          const [, tokenSymbol] = tokenId.split("::");
                          return (
                            <div
                              key={tokenId}
                              className="flex justify-between items-center gap-4"
                            >
                              <span className="text-sm text-zinc-400 min-w-[80px]">
                                {tokenSymbol || "Token"}
                              </span>
                              <span className="text-white font-medium text-right">
                                {formatBalance(token.balance)}
                              </span>
                            </div>
                          );
                        })}

                        {Object.entries(
                          balances[getWalletAddress(userWallet)]
                            .non_fungible_tokens
                        ).map(([tokenId, token]) => {
                          const [, tokenSymbol] = tokenId.split("::");
                          return (
                            <div
                              key={tokenId}
                              className="flex justify-between items-center gap-4"
                            >
                              <span className="text-sm text-zinc-400 min-w-[80px]">
                                {tokenSymbol || "NFT"}
                              </span>
                              <span className="text-white font-medium text-right">
                                {token.count} items
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>
              )}

              <div id="step6">
                {activeAgentWallets.map((wallet) => {
                  const walletBalance = getWalletAddress(wallet)
                    ? balances[getWalletAddress(wallet)]
                    : null;
                  const address = getWalletAddress(wallet);
                  const isCopied = address === copiedAddress;

                  return (
                    <div
                      key={wallet.id}
                      className="bg-zinc-800/50 rounded-lg p-4 space-y-3 mt-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-zinc-800/40">
                          <AvatarImage
                            src={wallet.agent?.image_url || undefined}
                          />
                          <AvatarFallback className="bg-zinc-900 text-zinc-500">
                            {wallet.agent?.name?.[0]?.toUpperCase() || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-white">
                          {wallet.agent?.name || "Agent"}
                        </span>
                      </div>

                      {address ? (
                        <button
                          onClick={() => copyToClipboard(address)}
                          className="w-full flex items-center justify-between text-xs text-zinc-500 font-mono hover:text-zinc-300 transition-colors group"
                        >
                          <span>{truncateAddress(address)}</span>
                          <span className="text-zinc-600 group-hover:text-zinc-400">
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </span>
                        </button>
                      ) : (
                        <div className="text-xs text-zinc-500 font-mono">
                          No wallet address
                        </div>
                      )}
                      {address && (
                        <StacksComponents
                          address={address}
                          amount={stxAmounts[address] || ""}
                          onAmountChange={(value) =>
                            handleAmountChange(address, value)
                          }
                          onToast={(title, description, variant) =>
                            toast({ title, description, variant })
                          }
                        />
                      )}
                      {walletBalance && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-sm text-zinc-400 min-w-[80px]">
                              STX Balance
                            </span>
                            <span className="text-white font-medium text-right">
                              {formatBalance(walletBalance.stx.balance)} STX
                            </span>
                          </div>

                          {Object.entries(walletBalance.fungible_tokens).map(
                            ([tokenId, token]) => {
                              const [, tokenSymbol] = tokenId.split("::");
                              return (
                                <div
                                  key={tokenId}
                                  className="flex justify-between items-center gap-4"
                                >
                                  <span className="text-sm text-zinc-400 min-w-[80px]">
                                    {tokenSymbol || "Token"}
                                  </span>
                                  <span className="text-white font-medium text-right">
                                    {formatBalance(token.balance)}
                                  </span>
                                </div>
                              );
                            }
                          )}

                          {Object.entries(
                            walletBalance.non_fungible_tokens
                          ).map(([tokenId, token]) => {
                            const [, tokenSymbol] = tokenId.split("::");
                            return (
                              <div
                                key={tokenId}
                                className="flex justify-between items-center gap-4"
                              >
                                <span className="text-sm text-zinc-400 min-w-[80px]">
                                  {tokenSymbol || "NFT"}
                                </span>
                                <span className="text-white font-medium text-right">
                                  {token.count} items
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
