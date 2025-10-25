import { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import ChatIcon from "../assets/chat_24dp.svg?react";
import AgentIcon from "../assets/support_agent_24dp.svg?react";
import SendIcon from "../assets/send_24dp.svg?react";
import CloseIcon from "../assets/close_24dp.svg?react";
import { useChatWebSocket } from "../hooks/useChatWebSocket";
import { useAuth } from "../hooks/useAuth";

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
      text: "Welcome to PedalPoint! How can I help you today? You can ask about bikes, get repair estimates, or ask for general assistance.",
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
        contents: `You are a professional bike shop assistant for PedalPoint. Always act like a helpful, knowledgeable shop assistant while providing accurate information.

For bike problems or repair questions, refer to this comprehensive guide to provide accurate cost estimates and parts recommendations:

# Bicycle Repair Parts and Cost Estimation Guide

## 1. Head Parts (Headset)
**Signs of damage:** Part is damaged when the handlebars shake or become difficult to control.
**Parts:**
- If only the bearing is damaged: Corona HP, Corona HP OS (S), Corona HP OS (L) - ₱15-20
- If the bearing housing/cup needs replacement: Head Parts Standard, Head Parts OS, Head Parts OS BB, Head Parts SB (various sizes) - ₱150-650
**Additional:** Grease ₱15  
**Labor/Service Charge:** ₱50-100 (bearing replacement only, installation of set)

## 2. Front Hub
**Signs of damage:** Front wheel shakes, wheel is misaligned preventing proper rolling/movement, or makes noise when there's internal damage not visible unless the hub is opened.
**Parts:**
- If axle is broken: Front Axle (different types depending on bike type) - ₱65-120
- If skewer is broken: Front Skewer ₱100, Optional: Front & Rear Skewer Set ₱180-350
- If only bearing is damaged: Steel balls ₱30, Corona Front ₱10, Sealed Bearing (various sizes) - ₱65-110
- If the bearing housing/hub needs replacement:
  - Hub Ord (Thread Type) ₱220-230
  - Hub Set (Thread Type) ₱750-1150
  - Hub Set (Cassette Type) ₱950-3650
**Additional:** Grease ₱15, Front Cone ₱10, Front Cup ₱15-25  
**Labor/Service Charge:** ₱50-400 (alignment, axle/bearing replacement, rimset alignment with hub replacement)

## 3. Chain Wheel/Bottom Bracket
**Signs of damage:** Chain wheel shakes, bearings fall out (meaning internal bearings are broken or the bearing housing is damaged).
**Parts:**
- If replacing the complete Bottom Bracket set: Cotterless Axle/ET/ET(Jumbo) ₱195-220, Bottom Bracket Set (various sizes and types) - ₱280-550
- If only bearing is damaged: Corona ET ₱12, Corona OPC ₱20, Corona 9/16 ₱12
**Additional:** Grease ₱15  
**Labor/Service Charge:** ₱50-100 (bearing or bottom bracket replacement)

## 4. Rear Hub
**Signs of damage:** Rear wheel shakes, wheel is misaligned preventing proper rolling, or makes noise when there's internal damage not visible unless the hub is opened.
**Parts:**
- If axle is broken: Rear Axle (different types depending on bike type) - ₱85-175
- If skewer is broken: Rear Skewer ₱120, Optional: Front & Rear Skewer Set ₱180-350
- If only bearing is damaged: Steel balls ₱30, Corona Rear ₱10, Sealed Bearing (various sizes) - ₱65-110
- If the bearing housing/hub needs replacement:
  - Hub Ord (Thread Type) ₱230-250
  - Hub Set (Thread Type) ₱750-1150
  - Hub Set (Cassette Type) ₱950-3650
**Additional:** Grease ₱15, Rear Cone ₱10, Rear Cup ₱15-25  
**Labor/Service Charge:** ₱50-400 (alignment, axle/bearing replacement, rimset alignment with hub replacement)

## 5. Sprocket
**Signs of damage:** No freewheel function (wheel doesn't spin freely or move unless pedaled), useful for downhills. When sprocket teeth become thin and sharp, the chain jumps. Internal bearings often wear out (not replaceable) causing wobbling.
**Parts:**
- Without gears/shifting: Single Sprocket 16/18/24T - ₱120-180
- With shifting mechanism:
  - Sprocket (Thread Type) 7/8 speed - ₱380-420
  - Sprocket (Cassette Type) 7/8/9/10/11/12 speed - ₱780-2150
**Additional:** Hub Spacer ₱45-65  
**Labor/Service Charge:** ₱50-150 (tune-up/tune-up with parts replacement)

## 6. Roller/RD (Rear Derailleur)
**Signs of damage:** Roller pulley or spring breaks. Sometimes bikes can't be tuned because the derailleur doesn't fit the shifter. Recommended to use same brand for shifter and derailleur.
**Parts:**
- Roller (7/8/9/10/11/12 speed) - ₱220-2250 (depending on sprocket speed count)
**Additional:** Roller Pulley ₱25-220  
**Labor/Service Charge:** ₱50-100 (tune-up/tune-up with parts replacement)

## 7. Chain
**Signs of damage:** Chain breaks or gaps become too large to be fixed with chain links. For cassette-type sprockets, chain should be replaced together for proper shifting/tuning.
**Parts:**
- Chain (7/8/9/10/11/12/olive speed) - ₱130-1400 (depending on sprocket speed count)
**Additional:** Single Chain Link ₱10, Chain Link 7/8/9/10/11 speed ₱45-65  
**Labor/Service Charge:** ₱30-80 (tune-up/tune-up with parts replacement)

## 8. Shifter
**Signs of damage:** No longer shifts or buttons can't be pressed (up or down).
**Parts:**
- Combo Shifter (with brakes) 7/8 speed - ₱650-780
- Shifter 8/9/10/11/12 speed - ₱420-875
**Additional:** Shifter Cable ₱25-175, Cable Housing ₱100 (per meter), Cable End ₱10  
**Labor/Service Charge:** ₱50-150 (tune-up/tune-up with parts replacement)

## 9. Brake Shoe/Brake Pad
**Signs of damage:** Brakes don't grip, meaning they're worn out or the entire caliper is damaged. For disc brakes, replace brake pads when they make noise against the rotor.
**Parts:**
- Brake Shoe (Caliper, V-Brake) - ₱15-175
- Brake Pad (Disc brake/Hydraulic brake) - ₱150-320
**Labor/Service Charge:** ₱30-50 (pad replacement)

Here's our conversation so far:
${aiMessages.map((msg) => `${msg.isUser ? "Customer" : "Assistant"}: ${msg.text}`).join("\n")}

Customer question: ${userMessage}

IMPORTANT: Always respond as a helpful PedalPoint shop assistant. 

If the customer is asking about a bike problem or repair issue:
1. Check if it matches something in the guide above
2. If it matches: Provide a natural, helpful response with professional diagnosis, cost estimate, and specific parts needed
3. If it doesn't match: Provide general advice and recommend bringing the bike in for inspection

If the customer is asking about general bike questions (not repairs): Answer as a helpful shop assistant

IMPORTANT: For ALL responses, write naturally as a helpful shop assistant. Do NOT use JSON format. 

For repair estimates, structure your response like this:
1. Brief diagnosis (1-2 sentences)
2. Parts needed (bullet points)
3. Cost estimate (total range)
4. Next steps recommendation

Keep responses concise and easy to read. Use line breaks between sections for better readability. Use exact part names and pricing from the guide when applicable.`,
      });

      const responseText = response.text || "";
      setAiMessages((prev) => [...prev, { text: responseText, isUser: false }]);
    } catch (error) {
      console.error("AI Error:", error);
      setAiMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I'm having trouble connecting. Please try again or switch to Live Chat for immediate assistance.",
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
              ? 'Live Support'
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
                <span className="hidden sm:inline">Live Chat</span>
                <span className="sm:hidden">Live</span>
                {activeTab === 'customer_chat' && (
                  <div
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></div>
                )}
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
                              alt="Avatar"
                              src="https://img.daisyui.com/images/profile/demo/anakeen@192.webp"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AgentIcon className="w-5 h-5 sm:w-7 sm:h-7" />
                          )
                        ) : isMyMessage ? (
                          <img
                            alt="Avatar"
                            src="https://img.daisyui.com/images/profile/demo/anakeen@192.webp"
                            className="w-full h-full object-cover"
                          />
                        ) : (
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
