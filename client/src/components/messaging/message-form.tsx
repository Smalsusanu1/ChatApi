import { useState } from "react";
import { useForm } from "react-hook-form";
import { useWebSocket } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { SendIcon } from "lucide-react";
import { WS_MESSAGE_TYPES } from "@shared/constants";

type MessageFormProps = {
  selectedUserId?: string;
  selectedGroupId?: string;
  disabled?: boolean;
};

export function MessageForm({ selectedUserId, selectedGroupId, disabled = false }: MessageFormProps) {
  const { sendMessage, status } = useWebSocket();
  const [isSending, setIsSending] = useState(false);

  const form = useForm({
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (data: { content: string }) => {
    if (!data.content.trim() || disabled || status !== "OPEN") return;
    
    setIsSending(true);
    
    try {
      if (selectedUserId) {
        sendMessage({
          type: "direct-message",
          receiverId: selectedUserId,
          content: data.content,
        });
      } else if (selectedGroupId) {
        sendMessage({
          type: "group-message",
          groupId: selectedGroupId,
          content: data.content,
        });
      }
      
      // Reset form after successful send
      form.reset();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="border-t p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormControl>
                <Textarea
                  placeholder={
                    disabled
                      ? "Select a recipient to start messaging"
                      : status !== "OPEN"
                      ? "Connecting to messaging service..."
                      : "Type your message here..."
                  }
                  className="min-h-[60px] resize-none"
                  {...field}
                  disabled={disabled || status !== "OPEN"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                />
              </FormControl>
            )}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={disabled || status !== "OPEN" || isSending}
            className="h-10 w-10"
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default MessageForm;
