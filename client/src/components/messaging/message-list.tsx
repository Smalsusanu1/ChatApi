import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  senderName?: string;
};

type MessageListProps = {
  selectedUserId?: string;
  selectedGroupId?: string;
  messages: Message[];
  isLoading: boolean;
};

export function MessageList({ selectedUserId, selectedGroupId, messages, isLoading }: MessageListProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={cn("flex items-start", i % 2 === 0 ? "justify-end" : "")}>
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-16 w-60 mt-1 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!selectedUserId && !selectedGroupId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <span className="material-icons text-4xl text-neutral-300 mb-2">chat</span>
        <p className="text-neutral-500">Select a user or group to start messaging</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <span className="material-icons text-4xl text-neutral-300 mb-2">forum</span>
        <p className="text-neutral-500">No messages yet. Start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto max-h-[calc(100vh-360px)]">
      {messages.map((message) => {
        const isCurrentUser = message.senderId === user?.id;
        const formattedTime = new Date(message.createdAt).toLocaleTimeString([], { 
          hour: "2-digit", 
          minute: "2-digit" 
        });

        return (
          <div
            key={message.id}
            className={cn(
              "flex items-start mb-4 gap-2",
              isCurrentUser ? "flex-row-reverse" : ""
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className={isCurrentUser ? "bg-primary" : "bg-secondary"}>
                {(message.senderName || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "px-3 py-2 rounded-md max-w-[70%]",
                isCurrentUser
                  ? "bg-primary text-white rounded-tr-none"
                  : "bg-neutral-100 rounded-tl-none"
              )}
            >
              {selectedGroupId && !isCurrentUser && (
                <p className="text-xs font-semibold mb-1">{message.senderName || 'Unknown'}</p>
              )}
              <p className="break-words">{message.content}</p>
              <p className={cn(
                "text-xs mt-1 text-right",
                isCurrentUser ? "text-primary-foreground/70" : "text-neutral-500"
              )}>
                {formattedTime}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
