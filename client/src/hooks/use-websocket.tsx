import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

type WebSocketStatus = "CONNECTING" | "OPEN" | "CLOSING" | "CLOSED" | "RECONNECTING";

type WebSocketMessage = {
  type: string;
  [key: string]: any;
};

export function useWebSocket() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<WebSocketStatus>("CLOSED");
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  const connect = useCallback(() => {
    if (!token || !user) return;
    
    // Close existing connection if any
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }

    try {
      setStatus("CONNECTING");
      
      // Create WebSocket connection with authentication token
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus("OPEN");
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages((prev) => [...prev, data]);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      socket.onclose = (event) => {
        setStatus("CLOSED");
        
        // Don't attempt to reconnect if connection was closed normally
        if (event.code !== 1000 && event.code !== 1001) {
          attemptReconnect();
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to messaging service",
          variant: "destructive",
        });
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      setStatus("CLOSED");
      attemptReconnect();
    }
  }, [token, user, toast]);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      toast({
        title: "Connection Failed",
        description: "Could not reconnect to messaging service after multiple attempts",
        variant: "destructive",
      });
      return;
    }

    setStatus("RECONNECTING");
    reconnectAttemptsRef.current += 1;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, reconnectDelay);
  }, [connect, toast]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    
    toast({
      title: "Message Not Sent",
      description: "Connection to messaging service lost. Reconnecting...",
      variant: "destructive",
    });
    
    connect(); // Try to reconnect
    return false;
  }, [connect, toast]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setStatus("CLOSED");
    reconnectAttemptsRef.current = 0;
  }, []);

  // Connect when component mounts and token is available
  useEffect(() => {
    if (token && user) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [token, user, connect, disconnect]);

  return {
    status,
    messages,
    sendMessage,
    connect,
    disconnect,
  };
}
