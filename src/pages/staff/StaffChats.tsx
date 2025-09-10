import ChatCard from "../../components/staff/ChatCard";
import ChatSearch from "../../components/staff/ChatSearch";
import SendSVG from "../../assets/send_24dp.svg?react";
import SupportAgentSVG from "../../assets/support_agent_24dp.svg?react";

function StaffChats() {
  // Sample chat data - in a real app this would come from an API
  const chatList = [
    {
      id: 1,
      customerName: "Sarah Johnson",
      lastMessage: "Hi, I have a question about my recent order #12345",
      timestamp: "2:30 PM",
      avatar: "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp",
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: 2,
      customerName: "Mike Chen",
      lastMessage: "Thanks for the quick response!",
      timestamp: "1:45 PM",
      avatar: "https://img.daisyui.com/images/profile/demo/kenobee@192.webp",
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: 3,
      customerName: "Emily Rodriguez",
      lastMessage: "Can you help me with the repair service?",
      timestamp: "12:20 PM",
      avatar: "https://img.daisyui.com/images/profile/demo/anakeen@192.webp",
      unreadCount: 1,
      isOnline: true,
    },
    {
      id: 4,
      customerName: "David Thompson",
      lastMessage: "I'm interested in the mountain bike collection",
      timestamp: "11:15 AM",
      avatar: "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp",
      unreadCount: 0,
      isOnline: false,
    },
  ];

  return (
    <div className="flex h-full flex-row">
      <div className="bg-base-200 flex h-full min-w-100 flex-col gap-1 rounded-md px-2">
        <div className="mt-5 mb-3">
          <ChatSearch />
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {chatList.map((chat) => (
            <ChatCard
              key={chat.id}
              customerName={chat.customerName}
              lastMessage={chat.lastMessage}
              timestamp={chat.timestamp}
              avatar={chat.avatar}
              unreadCount={chat.unreadCount}
              isOnline={chat.isOnline}
            />
          ))}
        </div>
      </div>

      <div className="bg-base-200 mx-3 flex h-full w-full flex-col rounded-md">
        <div className="flex min-h-fit flex-row items-center gap-2 border-b-1 border-gray-600 p-2 pl-5">
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img
                src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
                alt="Customer avatar"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold">Sarah Johnson</span>
            <span className="text-sm text-gray-500">Online</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-5">
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  alt="Customer avatar"
                  src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
                />
              </div>
            </div>
            <div className="chat-header">
              Sarah Johnson
              <time className="text-xs opacity-50">2:30 PM</time>
            </div>
            <div className="chat-bubble">
              Hi, I have a question about my recent order #12345
            </div>
            <div className="chat-footer opacity-50">Delivered</div>
          </div>

          <div className="chat chat-end">
            <div className="chat-image avatar">
              <SupportAgentSVG
                width={38}
                height={38}
                className="w-full rounded-full border bg-white p-1"
                fill="black"
              />
            </div>
            <div className="chat-header">
              Staff
              <time className="text-xs opacity-50">2:32 PM</time>
            </div>
            <div className="chat-bubble">
              Hello Sarah! I'd be happy to help you with your order. What would
              you like to know?
            </div>
            <div className="chat-footer opacity-50">Sent</div>
          </div>

          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  alt="Customer avatar"
                  src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
                />
              </div>
            </div>
            <div className="chat-header">
              Sarah Johnson
              <time className="text-xs opacity-50">2:35 PM</time>
            </div>
            <div className="chat-bubble">
              I was wondering when it will be shipped? The order status still
              shows 'Processing'
            </div>
            <div className="chat-footer opacity-50">Delivered</div>
          </div>
        </div>

        <div className="flex flex-row gap-5 px-5 pb-5">
          <input
            type="text"
            placeholder="Type your message..."
            className="input w-full"
          />
          <button className="btn btn-primary">
            <SendSVG />
          </button>
        </div>
      </div>
    </div>
  );
}

export default StaffChats;
