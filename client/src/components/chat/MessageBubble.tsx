'use client';

import { CheckIcon, ClockIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';

interface Message {
  id: string;
  body: string;
  fromMe: boolean;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  messageType: 'text' | 'image' | 'audio' | 'video' | 'document';
  mediaUrl?: string;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isOwn = message.fromMe;
  
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <CheckIcon className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckIcon className="h-3 w-3 text-blue-500" />;
      case 'read':
        return (
          <div className="relative">
            <CheckIcon className="h-3 w-3 text-blue-500" />
            <CheckIcon className="h-3 w-3 text-blue-500 absolute -left-1" />
          </div>
        );
      default:
        return <ClockIcon className="h-3 w-3 text-gray-400" />;
    }
  };
  
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isOwn
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 shadow'
        }`}
      >
        {message.messageType === 'text' && (
          <p className="text-sm break-words">{message.body}</p>
        )}
        
        {message.messageType === 'image' && message.mediaUrl && (
          <img src={message.mediaUrl} alt="Image" className="max-w-full rounded-lg" />
        )}
        
        <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
          <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
          {isOwn && getStatusIcon()}
        </div>
      </div>
    </div>
  );
}