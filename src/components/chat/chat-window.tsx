"use client";

import { useEffect, useCallback, useState } from "react";
import { ChatInput } from "./chat-input";
import { MessageList } from "./message-list";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Check, X, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChatStore } from "@/store/chat";
import { useSessionStore } from "@/store/session";
import { useThread } from "@/hooks/use-thread";
import { Input } from "@/components/ui/input";
import { useThreadsStore } from "@/store/threads";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentSelector } from "./agent-selector";
import { useAgents } from "@/hooks/use-agents";
import { CreateThreadButton } from "../threads/CreateThreadButton";

export function ChatWindow() {
  const {
    messages,
    isLoading: isChatLoading,
    error: chatError,
    isConnected,
    selectedAgentId,
    setSelectedAgent,
    clearMessages,
    connect,
    disconnect,
    activeThreadId,
  } = useChatStore();

  const { agents, loading: agentsLoading } = useAgents();
  const { thread, clearThread } = useThread(activeThreadId || "");
  const { accessToken } = useSessionStore();
  const {
    isEditing,
    editedTitle,
    startEditing,
    cancelEditing,
    setEditedTitle,
    saveEdit,
  } = useThreadsStore();
  const threadMessages = activeThreadId ? messages[activeThreadId] || [] : [];

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const memoizedConnect = useCallback(
    (token: string) => {
      connect(token);
    },
    [connect]
  );

  const memoizedDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  // Handle WebSocket connection
  useEffect(() => {
    let mounted = true;

    if (!accessToken) {
      return;
    }

    const connectWithDelay = () => {
      if (process.env.NODE_ENV === "development") {
        setTimeout(() => {
          if (mounted) {
            memoizedConnect(accessToken);
          }
        }, 100);
      } else {
        memoizedConnect(accessToken);
      }
    };

    connectWithDelay();

    return () => {
      mounted = false;
      if (process.env.NODE_ENV !== "development") {
        console.log("ChatWindow unmounting, disconnecting WebSocket");
        memoizedDisconnect();
      }
    };
  }, [accessToken, memoizedConnect, memoizedDisconnect]);

  // create function to clear messages for a specific thread
  const clearMessagesInThread = async (threadId: string) => {
    try {
      await clearThread();
      clearMessages(threadId);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error clearing thread:", error);
    }
  };

  if (!accessToken) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert>
          <AlertDescription>Please sign in to start chatting</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!agentsLoading && agents.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] backdrop-blur-sm">
        <div className="text-center space-y-4 p-6 max-w-md mx-auto">
          <div className="p-3 bg-primary/10 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-primary"
            >
              <path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="8" y1="22" x2="16" y2="22" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Create Your First AI Agent</h3>
          <p className="text-sm text-muted-foreground">
            To start chatting, you will need to create at least one AI agent.
            Agents are AI assistants that you can customize with specific roles
            and capabilities.
          </p>
          <Button
            onClick={() => (window.location.href = "/agents")}
            className="bg-primary hover:bg-primary/90"
          >
            Create an Agent
          </Button>
        </div>
      </div>
    );
  }

  if (!activeThreadId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] backdrop-blur-sm">
        <div className="text-center space-y-2.5 p-4 -mt-20">
          <p className="text-lg font-medium text-muted-foreground">
            Start a new Chat
          </p>
          <CreateThreadButton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative h-full w-full min-w-0 max-w-full">
      {/* Header - Fixed at top */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-2 md:px-4 h-14 border-b border-border/10 min-w-0 bg-background/80 backdrop-blur-sm w-full">
        <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
          {!isConnected && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground flex-shrink-0" />
          )}
          <span
            className={cn(
              "text-xs flex-shrink-0",
              isConnected ? "text-emerald-500" : "text-muted-foreground"
            )}
          >
            {isConnected ? "Connected" : "Connecting..."}
          </span>
          <span className="text-xs text-muted-foreground/40 mx-2 flex-shrink-0">
            •
          </span>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2 w-full">
                <Input
                  className="h-8 w-full md:w-48 text-sm bg-background/50"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Enter thread name"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => saveEdit(activeThreadId)}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={cancelEditing}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <span className="text-sm font-medium truncate min-w-0 flex-1">
                  {thread?.title || "Untitled Thread"}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => startEditing(activeThreadId)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isChatLoading}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="block md:hidden flex-shrink-0 ml-2">
          <AgentSelector
            selectedAgentId={selectedAgentId}
            onSelect={setSelectedAgent}
            disabled={isChatLoading || !isConnected}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Clear Thread Messages</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all messages in this thread? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => clearMessagesInThread(activeThreadId)}
              disabled={isChatLoading}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message List - Scrollable area */}
      <div className="flex-1 overflow-hidden w-full min-w-0 max-w-full">
        <ScrollArea className="h-[calc(100vh-8rem)] w-full">
          <div className="flex flex-col justify-end min-h-full w-full max-w-full">
            {chatError && (
              <Alert
                variant="destructive"
                className="mx-2 md:mx-4 my-2 md:my-4"
              >
                <AlertDescription>{chatError}</AlertDescription>
              </Alert>
            )}
            <MessageList messages={threadMessages} />
          </div>
        </ScrollArea>
      </div>

      {/* Input - Fixed at bottom */}
      <div className="sticky bottom-0 border-t border-border/10 bg-background/80 backdrop-blur-sm w-full min-w-0">
        <ChatInput
          selectedAgentId={selectedAgentId}
          onAgentSelect={setSelectedAgent}
          disabled={isChatLoading || !isConnected}
        />
      </div>
    </div>
  );
}
