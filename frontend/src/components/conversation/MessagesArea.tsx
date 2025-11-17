import React from 'react';
import type { Message } from '@/services/api';
import MessageBubble from './MessageBubble';

interface MessagesAreaProps {
  messages: Message[];
  isSending: boolean;
  instructorName?: string;
  instructorImage?: string;
  userName?: string;
  userImage?: string;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const MessagesArea: React.FC<MessagesAreaProps> = ({
  messages,
  isSending,
  instructorName,
  instructorImage,
  userName,
  userImage,
  messagesContainerRef,
  messagesEndRef,
}) => {
  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto bg-white px-6 mb-24 pt-6"
    >
      <div className="h-full">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-4">
                <MessageBubble 
                  message={{
                    id: 'empty',
                    conversation: '',
                    role: 'assistant',
                    sender_type: 'system',
                    content: 'Hi! 👋',
                    created_at: new Date().toISOString(),
                  } as any}
                />
              </div>
              <p className="text-gray-900 text-lg font-semibold mb-2">Start a Conversation</p>
              <p className="text-gray-500 text-sm">Send a message to begin chatting</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                instructorName={instructorName}
                instructorImage={instructorImage}
                userName={userName}
                userImage={userImage}
              />
            ))}
            {isSending && (
              <div className="flex gap-3 mb-4">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">I</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-700 px-1 mb-1">Instructor</span>
                  <div className="flex items-center gap-1 px-4 py-2.5 bg-gray-200 text-gray-900 rounded-xl rounded-bl-none">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesArea;
