import { useState, useEffect, useRef, useCallback } from 'react';

export interface ChatMessage {
  id: number;
  user: number | null;
  user_name: string;
  user_avatar: string | null;
  sender?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  staff_name?: string;
  customer_name?: string;
  room_id: string;
  room_type: string;
  message_type: 'customer' | 'staff' | 'system';
  content: string;
  timestamp: string;
  formatted_timestamp: string;
  is_read: boolean;
  is_system_message: boolean;
}

interface UseChatWebSocketReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  sendMessage: (content: string) => void;
  markRead: () => void;
  connectionError: string | null;
}

export const useChatWebSocket = (roomId: string, isStaffInterface: boolean = false): UseChatWebSocketReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const processedMessageIds = useRef<Set<number>>(new Set());
  const isStaffInterfaceRef = useRef(isStaffInterface);
  
  // Update ref when prop changes
  useEffect(() => {
    isStaffInterfaceRef.current = isStaffInterface;
  }, [isStaffInterface]);

  // Get API base URL
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const connect = useCallback(() => {
    // Don't connect if roomId is empty or invalid (including 'invalid' placeholder)
    if (!roomId || roomId.trim() === '' || roomId === 'invalid') {
      console.log('Skipping WebSocket connection: Invalid or empty room ID', { roomId });
      setConnectionError('User not authenticated');
      setIsConnected(false);
      return;
    }

    try {
      // Close existing connection if it points to a different room
      if (wsRef.current) {
        try {
          // Avoid thrashing: only close if a different room is requested
          const sameRoom = (wsRef.current as any).__roomId === roomId;
          if (!sameRoom && wsRef.current.readyState === WebSocket.OPEN) {
            console.log('Closing previous WebSocket before switching rooms');
            wsRef.current.close(1000, 'Switching rooms');
          }
        } catch (_) {
          // Best-effort close
          wsRef.current.close();
        }
      }

      const encodedRoomId = encodeURIComponent(roomId);
      // Ensure proper URL construction
      const wsProtocol = apiBaseUrl.startsWith('https') ? 'wss' : 'ws';
      const baseUrl = apiBaseUrl.replace(/^https?/, '');
      const wsUrl = `${wsProtocol}${baseUrl}/ws/api/chat/${encodedRoomId}/`;

      console.log('Connecting to WebSocket:', wsUrl, { roomId, encodedRoomId, apiBaseUrl, wsProtocol, baseUrl });
      const ws = new WebSocket(wsUrl);
      // Tag the socket with its room for comparison next time
      (ws as any).__roomId = roomId;
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Chat WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);

          switch (data.type) {
            case 'chat_history':
              // Reset processed IDs when loading history
              processedMessageIds.current.clear();
              const historyMessages = data.data || [];
              historyMessages.forEach((msg: ChatMessage) => {
                if (msg.id) processedMessageIds.current.add(msg.id);
              });
              setMessages(historyMessages);
              break;
            case 'chat_message':
              // Only add if we haven't seen this message ID before
              const newMessage = data.message;
              if (newMessage && newMessage.id && !processedMessageIds.current.has(newMessage.id)) {
                processedMessageIds.current.add(newMessage.id);
                setMessages(prev => [...prev, newMessage]);
              }
              break;
            case 'chat_read':
              // Handle read receipts: update is_read for messages
              try {
                const reader = data?.data?.reader;
                console.log('Received chat_read event:', { reader, data });
                
                if (reader === 'staff') {
                  // Staff read customer messages
                  setMessages(prev => prev.map(m =>
                    m.message_type === 'customer' ? { ...m, is_read: true } : m
                  ));
                } else if (reader === 'customer') {
                  // Customer read staff messages
                  setMessages(prev => prev.map(m =>
                    m.message_type === 'staff' ? { ...m, is_read: true } : m
                  ));
                }
              } catch (error) {
                console.error('Error handling chat_read:', error);
              }
              break;
            case 'error':
              console.error('WebSocket error:', data.message);
              setConnectionError(data.message);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection error');
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);

        // Auto-reconnect after 3 seconds if not intentionally closed
        if (event.code !== 1000) {
          setTimeout(() => {
            console.log('Attempting to reconnect...');
            // Reconnect only for the same roomId
            connect();
          }, 3000);
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to connect');
    }
  }, [roomId, apiBaseUrl]);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        content: content,
      }));
    } else {
      console.error('WebSocket is not connected');
      setConnectionError('Not connected');
    }
  }, []);

  const markRead = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ 
        type: 'mark_read',
        is_staff_interface: isStaffInterfaceRef.current
      }));
    }
  }, []);

  // Connect on mount and when roomId changes
  useEffect(() => {
    console.log('useChatWebSocket: roomId changed:', roomId);
    if (roomId && roomId.trim() !== '' && roomId !== 'invalid') {
      // Clear processed messages when room changes
      processedMessageIds.current.clear();
      connect();
    }

    // Cleanup on unmount or room change
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'Room changed or component unmounted');
        wsRef.current = null;
      }
    };
  }, [roomId, connect]);

  return {
    messages,
    isConnected,
    sendMessage,
    markRead,
    connectionError,
  };
};
