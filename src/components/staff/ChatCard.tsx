interface ChatCardProps {
  customerName: string;
  lastMessage: string;
  timestamp: string;
  avatar?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

function ChatCard({
  customerName,
  lastMessage,
  timestamp,
  avatar = "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp",
  unreadCount = 0,
  isOnline = false,
}: ChatCardProps) {
  return (
    <div className="card bg-base-100 cursor-pointer flex-row p-3 shadow-md transition-shadow hover:shadow-lg">
      <div className="avatar relative">
        <div className="w-12 rounded-full">
          <img src={avatar} alt={`${customerName}'s avatar`} />
        </div>
        {isOnline && (
          <div className="border-base-100 absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 bg-green-500"></div>
        )}
      </div>
      <div className="ml-3 flex w-full flex-col">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">{customerName}</span>
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="line-clamp-1 max-w-32 text-sm text-gray-600">
            {lastMessage}
          </span>
          {unreadCount > 0 && (
            <div className="badge badge-primary badge-sm ml-2">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatCard;
