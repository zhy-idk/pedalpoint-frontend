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
  isOnline = false
}: ChatCardProps) {
  return (
    <div className="card bg-base-100 cursor-pointer flex-row p-3 shadow-md hover:shadow-lg transition-shadow">
      <div className="avatar relative">
        <div className="w-12 rounded-full">
          <img src={avatar} alt={`${customerName}'s avatar`} />
        </div>
        {isOnline && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-base-100 rounded-full"></div>
        )}
      </div>
      <div className="ml-3 flex w-full flex-col">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-base">{customerName}</span>
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="line-clamp-1 text-sm text-gray-600 max-w-32">
            {lastMessage}
          </span>
          {unreadCount > 0 && (
            <div className="badge badge-primary badge-sm ml-2">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatCard;
