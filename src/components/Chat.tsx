import { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import ChatIcon from "../assets/chat_24dp.svg?react";
import AgentIcon from "../assets/support_agent_24dp.svg?react";
import SendIcon from "../assets/send_24dp.svg?react";
import CloseIcon from "../assets/close_24dp.svg?react";
import { useChatWebSocket } from "../hooks/useChatWebSocket";
import { useAuth } from "../hooks/useAuth";
import { apiBaseUrl } from "../api";
import PlaceholderProfile from "../assets/placeholder_profile.png";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

type TabType = 'customer_chat' | 'ai_assistant';

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('customer_chat');
  const [inputText, setInputText] = useState("");
  const { user, isAuthenticated } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Only authenticated users can use chat
  const roomId = isAuthenticated && user?.id ? `customer_${user.id}` : '';

  // Use WebSocket for real-time chat (only if authenticated)
  const { messages, isConnected, sendMessage, markRead, connectionError } = useChatWebSocket(roomId);

  // AI Assistant messages (local only)
  const [aiMessages, setAiMessages] = useState([
    {
      text: "Welcome to PedalPoint! How can I help you today? Ask about bikes, services, or general assistance.",
      isUser: false,
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    if (activeTab === 'customer_chat') {
      sendMessage(inputText);
    } else {
      sendAiMessage(inputText);
    }
    setInputText("");
  };

  // AI Assistant with Gemini
  const sendAiMessage = async (userMessage: string) => {
    setAiMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setIsAiLoading(true);

    try {
      // Combined prompt for all bike-related questions
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: `You are a professional bike shop assistant for PedalPoint. Always act like a friendly, knowledgeable shop associate while providing accurate information.

Focus on helping customers with questions about bikes, accessories, services, maintenance tips, and scheduling repairs. Offer helpful guidance, recommend appropriate services, and invite customers to visit or book an appointment for detailed diagnostics or pricing.

Here's our conversation so far:
${aiMessages.map((msg) => `${msg.isUser ? "Customer" : "Assistant"}: ${msg.text}`).join("\n")}

Customer question: ${userMessage}

IMPORTANT: Always respond as a helpful PedalPoint shop assistant. Keep responses concise and easy to read. Use natural language, not JSON, and maintain a warm, professional tone. If a customer asks for exact pricing, let them know a technician can provide an accurate quote after an inspection.`,
      });

      const responseText = response.text || "";
      setAiMessages((prev) => [...prev, { text: responseText, isUser: false }]);
    } catch (error) {
      console.error("AI Error:", error);
      setAiMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I'm having trouble connecting. Please try again or switch to Chat Support for immediate assistance.",
          isUser: false,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleKeyPress = (e: { key: string }) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const currentMessages = activeTab === 'customer_chat' ? messages : aiMessages;
  const isLoading = activeTab === 'customer_chat' ? !isConnected : isAiLoading;

  // Auto-scroll to bottom when new messages arrive or tab changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, activeTab]);

  // Mark messages as read when chat is open and on customer_chat tab
  useEffect(() => {
    if (isOpen && activeTab === 'customer_chat' && messages.length > 0 && isConnected) {
      markRead();
    }
  }, [isOpen, activeTab, messages.length, isConnected]); // Removed markRead from dependencies to use the ref version

  // Don't show chat for unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn btn-md sm:btn-lg btn-circle btn-info lg:btn-xl fixed bottom-4 sm:bottom-8 left-4 sm:left-8 z-10 transition-opacity duration-300 ${
          isOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <ChatIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-2 left-2 right-2 sm:bottom-20 sm:left-8 sm:right-auto z-40 h-[calc(100vh-5rem)] sm:h-96 w-auto sm:w-100 transform rounded-lg transition-all duration-300 ease-in-out ${
          isOpen
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        {/* Chat Header */}
        <div className="bg-info flex items-center justify-between rounded-t-lg p-2 sm:p-3 text-white">
          <h3 className="text-xs sm:text-sm font-semibold truncate">
            {activeTab === 'customer_chat'
              ? 'Chat Support'
              : 'AI Assistant'}
          </h3>
          <button onClick={() => setIsOpen(false)} className="btn btn-circle btn-xs shrink-0">
            <CloseIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex h-full flex-col overflow-hidden rounded-b-lg">
          {/* Tabs */}
          <div className="tabs tabs-boxed bg-base-200 p-1">
            <button
              className={`tab tab-xs sm:tab-sm flex-1 text-[10px] sm:text-xs ${
                activeTab === 'customer_chat' ? 'tab-active' : ''
              }`}
              onClick={() => {
                setActiveTab('customer_chat');
                setInputText('');
              }}
            >
              <div className="flex items-center gap-1">
                <span className="hidden sm:inline">Chat Support</span>
                <span className="sm:hidden">Support</span>
              </div>
            </button>
            <button
              className={`tab tab-xs sm:tab-sm flex-1 text-[10px] sm:text-xs ${
                activeTab === 'ai_assistant' ? 'tab-active' : ''
              }`}
              onClick={() => {
                setActiveTab('ai_assistant');
                setInputText('');
              }}
            >
              <span className="hidden sm:inline">AI Assistant</span>
              <span className="sm:hidden">AI</span>
            </button>
          </div>

          {/* Connection Error */}
          {activeTab === 'customer_chat' && connectionError && (
            <div className="bg-red-100 text-red-800 text-xs p-2 text-center">
              Connection Error: {connectionError}
            </div>
          )}

          {/* Messages */}
          <div className="bg-base-100 flex-1 overflow-y-auto p-2 sm:p-3">
            <div className="space-y-2">
              {currentMessages.map((message, index) => {
                // For customer_chat, check if sender is current user
                const isMyMessage = activeTab === 'customer_chat'
                  ? (message as any).sender?.id === user?.id
                  : (message as any).isUser;

                return (
                  <div
                    key={index}
                    className={`chat ${isMyMessage ? 'chat-end ml-4 sm:ml-8' : 'chat-start mr-4 sm:mr-8'}`}
                  >
                    <div className="chat-image avatar">
                      <div className="w-6 sm:w-8 rounded-full">
                        {activeTab === 'ai_assistant' ? (
                          isMyMessage ? (
                            <img
                              alt="User Avatar"
                              src={
                                user?.primaryUserInfo?.image
                                  ? `${apiBaseUrl}${user.primaryUserInfo.image}`
                                  : PlaceholderProfile
                              }
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = PlaceholderProfile;
                              }}
                            />
                          ) : (
                            <AgentIcon className="w-5 h-5 sm:w-7 sm:h-7" />
                          )
                        ) : isMyMessage ? (
                          <img
                            alt="User Avatar"
                            src={
                              user?.primaryUserInfo?.image
                                ? `${apiBaseUrl}${user.primaryUserInfo.image}`
                                : PlaceholderProfile
                            }
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = PlaceholderProfile;
                            }}
                          />
                        ) : (
                          // Staff messages always show support agent icon
                          <AgentIcon className="w-5 h-5 sm:w-7 sm:h-7" />
                        )}
                      </div>
                    </div>
                    <div className="chat-header text-[10px] sm:text-xs">
                      {activeTab === 'ai_assistant'
                        ? isMyMessage
                          ? 'You'
                          : 'AI'
                        : isMyMessage
                        ? 'You'
                        : (message as any).staff_name || 'Staff'}
                      <time className="ml-1 text-[9px] sm:text-xs opacity-50">
                        {(activeTab === 'customer_chat'
                          ? (message as any).formatted_timestamp
                          : undefined) ||
                          new Date().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                      </time>
                    </div>
                    <div className="chat-bubble max-w-[200px] sm:max-w-xs text-[11px] sm:text-xs leading-relaxed whitespace-pre-line">
                      {(message as any).content || (message as any).text}
                    </div>
                    {activeTab === 'customer_chat' && isMyMessage && (
                      <div className="text-[9px] sm:text-[10px] opacity-60 ml-6 sm:ml-10 mt-0.5">
                        {(message as any).is_read ? 'Seen' : 'Sent'}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading indicator */}
              {isLoading && (
                <div className="chat chat-start mr-4 sm:mr-8">
                  <div className="chat-image avatar">
                    <div className="w-6 sm:w-8 rounded-full">
                      <AgentIcon className="w-5 h-5 sm:w-7 sm:h-7" />
                    </div>
                  </div>
                  <div className="chat-header text-[10px] sm:text-xs">
                    {activeTab === 'customer_chat'
                      ? 'Staff'
                      : 'AI'}
                  </div>
                  <div className="chat-bubble text-xs">
                    <span className="loading loading-dots loading-xs"></span>
                  </div>
                </div>
              )}

              {/* Invisible div for auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-base-100 p-2 sm:p-3">
            <div className="flex space-x-1 sm:space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  activeTab === 'customer_chat'
                    ? 'Message...'
                    : 'Ask...'
                }
                disabled={isLoading}
                className="input input-xs sm:input-sm flex-1 rounded px-2 py-1 text-[11px] sm:text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                className="btn btn-ghost btn-xs sm:btn-sm px-2 sm:px-3 py-1"
              >
                <SendIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
