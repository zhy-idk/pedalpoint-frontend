import { useState, useEffect, useRef, useCallback } from 'react';

interface InventoryItem {
  id: number;
  name: string;
  variant_attribute: string;
  brand: string;
  price: number;
  supplier_price?: number;
  stock: number;
  sku: string;
  available: boolean;
  product_listing?: number;
  supply?: string;
  supply_id?: number;
}

interface InventoryUpdate {
  type: 'inventory_update';
  data: InventoryItem | { action: string; product_id?: number; data: InventoryItem | InventoryItem[] };
}

interface UseInventoryWebSocketReturn {
  inventory: InventoryItem[];
  isConnected: boolean;
  error: string | null;
  sendMessage: (message: any) => void;
  refreshInventory: () => void;
}

export const useInventoryWebSocket = (): UseInventoryWebSocketReturn => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      // WebSocket should connect to Django server (port 8000), not React dev server (port 5173)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Use environment variable or determine from current host
      let apiHost = import.meta.env.VITE_WS_URL;
      if (!apiHost) {
        // If no env var, use same host as current page but port 8000
        const currentHost = window.location.hostname;
        apiHost = `${currentHost}:8000`;
      }
      const wsUrl = `${protocol}//${apiHost}/ws/api/inventory/`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('Inventory WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        
        // Request current inventory data
        if (ws.current) {
          ws.current.send(JSON.stringify({ type: 'get_inventory' }));
        }
      };

      ws.current.onmessage = (event) => {
        console.log('DEBUG: WebSocket message received:', event.data);
        try {
          const message: InventoryUpdate = JSON.parse(event.data);
          
          if (message.type === 'inventory_update') {
            console.log('DEBUG: Processing inventory update:', message.data);
            const { data } = message;
            
            if (typeof data === 'object' && 'action' in data) {
              // Handle special actions (delete, bulk update, etc.)
              switch (data.action) {
                case 'deleted':
                  setInventory(prev => prev.filter(item => item.id !== data.product_id));
                  break;
                case 'bulk_update':
                  if (Array.isArray(data.data)) {
                    setInventory(prev => {
                      const updated = [...prev];
                      (Array.isArray(data.data) ? data.data : [data.data]).forEach((updatedItem: InventoryItem) => {
                        const index = updated.findIndex(item => item.id === updatedItem.id);
                        if (index !== -1) {
                          updated[index] = updatedItem;
                        } else {
                          updated.push(updatedItem);
                        }
                      });
                      return updated;
                    });
                  }
                  break;
                default:
                  // Handle single item update
                  if (!Array.isArray(data.data)) {
                    setInventory(prev => {
                      const itemData = data.data as InventoryItem;
                      const index = prev.findIndex(item => item.id === itemData.id);
                      if (index !== -1) {
                        const updated = [...prev];
                        updated[index] = itemData;
                        return updated;
                      } else {
                        return [...prev, itemData];
                      }
                    });
                  }
              }
            } else {
              // Handle direct inventory data (array of items)
              if (Array.isArray(data)) {
                setInventory(data);
              } else {
                // Handle single item update
                setInventory(prev => {
                  const index = prev.findIndex(item => item.id === data.id);
                  if (index !== -1) {
                    const updated = [...prev];
                    updated[index] = data;
                    return updated;
                  } else {
                    return [...prev, data];
                  }
                });
              }
            }
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          setError('Failed to parse inventory update');
        }
      };

      ws.current.onclose = () => {
        console.log('Inventory WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect inventory WebSocket (attempt ${reconnectAttempts.current})`);
            connect();
          }, delay);
        } else {
          setError('Failed to connect to inventory updates. Please refresh the page.');
        }
      };

      ws.current.onerror = (err) => {
        console.error('Inventory WebSocket error:', err);
        setError('WebSocket connection error');
      };

    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to connect to inventory updates');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', message);
    }
  }, []);

  const refreshInventory = useCallback(() => {
    sendMessage({ type: 'get_inventory' });
  }, [sendMessage]);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    inventory,
    isConnected,
    error,
    sendMessage,
    refreshInventory
  };
};
