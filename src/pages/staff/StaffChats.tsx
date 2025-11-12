import { useState, useEffect, useCallback, useRef } from "react";
import ChatCard from "../../components/staff/ChatCard";
import ChatSearch from "../../components/staff/ChatSearch";
import SendSVG from "../../assets/send_24dp.svg?react";
import SupportAgentSVG from "../../assets/support_agent_24dp.svg?react";
import { useChatWebSocket } from "../../hooks/useChatWebSocket";
import { useAuth } from "../../hooks/useAuth";
import { apiBaseUrl } from "../../api/index";
import PlaceholderProfile from "../../assets/placeholder_profile.png";

interface ChatRoom {
  id: string;
  customerName: string;
  customerId: number | null;
  lastMessage: string;
  lastMessageType?: 'customer' | 'staff' | 'system';
  lastMessageSenderId?: number | null;
  timestamp: string;
  avatar: string;
  unreadCount: number;
  isOnline: boolean;
  messageCount: number;
  customerEmail?: string;
}

function StaffChats() {
  const { user } = useAuth();
  const [selectedChatRoom, setSelectedChatRoom] = useState<string>("");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all active chat rooms from the backend
  const fetchChatRooms = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/chat/rooms/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Fetch response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Fetch response data:", data);
        
        if (data.success && data.chat_rooms) {
          console.log("Received chat rooms:", data.chat_rooms.map((room: any) => room.id));

          // Check for duplicate IDs
          const roomIds = data.chat_rooms.map(room => room.id);
          const uniqueIds = [...new Set(roomIds)];
          if (roomIds.length !== uniqueIds.length) {
            console.warn("Duplicate room IDs detected:", roomIds);
          }

          // Normalize API fields and remove duplicates based on room ID
          const normalized = data.chat_rooms.map((room: any) => ({
            id: room.id,
            customerName: room.customer_name || room.user_name || 'Customer',
            customerId: room.customer_id ?? null,
            lastMessage: room.last_message || '',
            lastMessageType: room.last_message_type || null,
            lastMessageSenderId: room.last_message_sender_id || null,
            timestamp: room.formatted_timestamp || room.timestamp || '',
            avatar: room.customer_avatar || room.user_avatar 
              ? (room.customer_avatar?.startsWith('/') || room.user_avatar?.startsWith('/') 
                  ? `${apiBaseUrl}${room.customer_avatar || room.user_avatar}`
                  : room.customer_avatar || room.user_avatar)
              : PlaceholderProfile,
            unreadCount: room.unread_count ?? 0,
            isOnline: room.is_online ?? true,
            messageCount: room.message_count ?? 0,
          }));

          const uniqueRooms = normalized.filter((room, index, self) =>
            index === self.findIndex(r => r.id === room.id)
          );

          console.log(`Filtered from ${data.chat_rooms.length} to ${uniqueRooms.length} unique rooms`);

          // Merge with existing rooms to preserve sender info from WebSocket updates
          setChatRooms(prev => {
            const merged = uniqueRooms.map(newRoom => {
              const existingRoom = prev.find(r => r.id === newRoom.id);
              // Use API's sender info if available, otherwise preserve existing sender info
              if (existingRoom && !newRoom.lastMessageSenderId && existingRoom.lastMessageSenderId) {
                return {
                  ...newRoom,
                  lastMessageSenderId: existingRoom.lastMessageSenderId,
                  lastMessageType: existingRoom.lastMessageType || newRoom.lastMessageType,
                };
              }
              return newRoom;
            });
            return merged;
          });

          // Select first room by default if available and none selected
          if (uniqueRooms.length > 0 && !selectedChatRoom) {
            setSelectedChatRoom(uniqueRooms[0].id);
          }
        } else {
          console.error("Response missing success or chat_rooms:", data);
        }
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch chat rooms:", response.status, response.statusText, errorText);
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [selectedChatRoom]);

  // Fetch chat rooms on component mount and every 10 seconds
  useEffect(() => {
    fetchChatRooms();
    const interval = setInterval(fetchChatRooms, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [fetchChatRooms]);

  // Use WebSocket for the selected chat room (always call the hook)
  // Pass isStaffInterface=true to mark as read by staff
  const { messages, isConnected, sendMessage, connectionError, markRead } = useChatWebSocket(selectedChatRoom || 'invalid', true);

  // Update chat room message count when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && selectedChatRoom) {
      const lastMessage = messages[messages.length - 1];
      setChatRooms(prev => prev.map(room =>
        room.id === selectedChatRoom
          ? {
              ...room,
              lastMessage: lastMessage?.content || room.lastMessage,
              lastMessageType: lastMessage?.message_type || room.lastMessageType,
              lastMessageSenderId: lastMessage?.sender?.id || lastMessage?.user || room.lastMessageSenderId,
            }
          : room
      ));
    }
  }, [messages, selectedChatRoom]);

  // Mark as read when room is selected or when new messages arrive
  useEffect(() => {
    if (selectedChatRoom && messages.length > 0 && isConnected) {
      // Mark as read on the server
      markRead();
      
      // Also update the chat room's unread count to 0 in the local state
      setChatRooms(prev => prev.map(room =>
        room.id === selectedChatRoom
          ? { ...room, unreadCount: 0 }
          : room
      ));
    }
  }, [selectedChatRoom, messages.length, isConnected]); // Triggers when room changes or new messages arrive

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      sendMessage(message);
    }
  };

  // Filter chat rooms based on search query
  const filteredChatRooms = chatRooms.filter(room => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      room.customerName.toLowerCase().includes(query) ||
      room.customerEmail?.toLowerCase().includes(query) ||
      room.lastMessage.toLowerCase().includes(query)
    );
  });

  const selectedRoom = chatRooms.find(room => room.id === selectedChatRoom);

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Chat list sidebar - hidden on mobile when chat is selected */}
      <div className={`bg-base-200 flex h-full w-full md:min-w-64 md:max-w-80 flex-col gap-1 rounded-md px-2 ${selectedChatRoom ? 'hidden md:flex' : ''}`}>
        <div className="mt-5 mb-3">
          <ChatSearch value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {isLoadingRooms ? (
            <div className="flex items-center justify-center p-4">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : chatRooms.length === 0 ? (
            <div className="text-center text-sm text-gray-500 p-4">
              No active chats yet. Customers will appear here when they message.
            </div>
          ) : filteredChatRooms.length === 0 ? (
            <div className="text-center text-sm text-gray-500 p-4">
              No chats found matching "{searchQuery}"
            </div>
          ) : (
            filteredChatRooms.map((room, index) => (
              <div
                key={`${room.id}-${index}`}
                onClick={() => {
                  setSelectedChatRoom(room.id);
                }}
                className={`cursor-pointer rounded-lg p-2 md:p-3 transition-colors ${
                  selectedChatRoom === room.id ? 'bg-primary text-primary-content' : 'hover:bg-base-300'
                }`}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="avatar">
                    <div className="w-8 md:w-10 rounded-full">
                      <img src={room.avatar} alt={`${room.customerName} avatar`} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-xs md:text-sm truncate">{room.customerName}</p>
                      <div className="flex items-center gap-1">
                        {room.unreadCount > 0 && (
                          <span className="badge badge-error badge-xs">{room.unreadCount}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-base-content/70 truncate">
                      {room.lastMessageSenderId === user?.id ? 'you: ' : ''}{room.lastMessage}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-base-content/50">{room.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat conversation area - only shown when a room is selected */}
      <div className={`bg-base-200 md:mx-3 flex h-full w-full flex-col rounded-md ${!selectedChatRoom ? 'hidden md:flex' : ''}`}>
        {selectedRoom ? (
          <>
        <div className="flex min-h-fit flex-row items-center gap-2 border-b-1 border-gray-600 p-2 pl-5">
          {/* Back button for mobile */}
          <button
            onClick={() => setSelectedChatRoom('')}
            className="btn btn-ghost btn-sm md:hidden"
            aria-label="Back to chat list"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="avatar">
            <div className="w-12 rounded-full">
                  <img src={selectedRoom.avatar} alt={`${selectedRoom.customerName} avatar`} />
            </div>
          </div>
          <div className="flex flex-col">
                <span className="text-xl font-semibold">{selectedRoom.customerName}</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-3 md:px-5">
              {messages.map((message, index) => {
                // Check if the sender is the current logged-in user
                const isMyMessage = message.sender?.id === user?.id;
                
                return (
                  <div
                    key={index}
                    className={`chat ${isMyMessage ? "chat-end md:ml-8" : "chat-start md:mr-8"}`}
                  >
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                        {message.message_type === 'staff' ? (
                <SupportAgentSVG
                  width={38}
                  height={38}
                  className="w-full rounded-full border bg-white p-1"
                  fill="black"
                />
                        ) : (
                          <img src={selectedRoom.avatar} alt="Customer avatar" />
                        )}
                      </div>
              </div>
              <div className="chat-header">
                      {isMyMessage
                        ? "You"
                        : (message.customer_name || message.staff_name || message.user_name || "User")
                      }
                      <time className="text-xs opacity-50">{message.formatted_timestamp}</time>
              </div>
              <div className="chat-bubble">
                      {message.content}
              </div>
            </div>
                );
              })}

              {!isConnected && (
                <div className="chat chat-center">
                  <div className="chat-bubble bg-red-100 text-red-800">
                    Connection lost. Trying to reconnect...
              </div>
            </div>
              )}
              
              {/* Invisible div for auto-scroll */}
              <div ref={messagesEndRef} />
        </div>

        <div className="flex flex-row gap-2 md:gap-5 px-3 md:px-5 pb-3 md:pb-5">
          <input
            type="text"
            placeholder="Type your message..."
            className="input input-sm md:input-md w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    handleSendMessage(input.value);
                    input.value = '';
                  }
                }}
                disabled={!isConnected}
              />
              <button
                className="btn btn-primary btn-sm md:btn-md"
                disabled={!isConnected}
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Type your message..."]') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    handleSendMessage(input.value);
                    input.value = '';
                  }
                }}
              >
            <SendSVG />
          </button>
        </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat room to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffChats;

