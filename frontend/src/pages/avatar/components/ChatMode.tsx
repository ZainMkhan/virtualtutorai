import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Copy, Check } from 'lucide-react';
import { geminiService, type ChatMessage } from '../../../services/gemini';
import { useAuth } from '../../../contexts/AuthContext';
import type { Avatar } from '../../../services/api';

interface ChatModeProps {
  avatar: Avatar;
  isActive: boolean;
}

const ChatMode: React.FC<ChatModeProps> = ({ avatar, isActive }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isActive && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: `Hello! I'm ${avatar.name}, your AI assistant. I'm here to help you with any questions or have a conversation. What would you like to talk about?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isActive, avatar.name, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const copyToClipboard = async (text: string, messageIndex: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageIndex);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);
    setError(null);

    try {
      console.log('Sending chat message:', userMessage.content);
      const response = await geminiService.sendMessage(
        [...messages, userMessage],
        {
          name: avatar.name,
          category: avatar.category,
          knowledgeBaseId: avatar.metadata?.knowledgeBaseId
        }
      );

      console.log('AI Response:', response);

      if (response.success && response.data) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        console.log('Message added to chat');
      } else {
        console.error('AI response failed:', response.message);
        setError(response.message || 'Failed to get response');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="h-[80vh] max-h-[80vh] w-full flex flex-col bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Chat Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
              {avatar.preview_image ? (
                <img
                  src={avatar.preview_image}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Bot className="h-4 w-4 text-white" />
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">{avatar.name}</h2>
            <p className="text-blue-100 text-xs flex items-center">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
              Online • {avatar.category} Specialist
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 min-h-0">
        <div className="w-full px-6 py-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start group ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } animate-fade-in message-bubble`}
            >
              {message.role === 'assistant' ? (
                <>
                  {/* Assistant Avatar */}
                  <div className="flex-shrink-0 relative mr-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
                      {avatar.preview_image ? (
                        <img
                          src={avatar.preview_image}
                          alt={avatar.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Bot className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </div>
                  
                  {/* Assistant Message Bubble */}
                  <div className="relative max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-white text-gray-900 shadow-lg rounded-3xl rounded-tl-md px-6 py-4 transition-all duration-200 hover:shadow-xl border border-gray-100">
                    {/* Message Content */}
                    <div className="relative">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <button
                        onClick={() => copyToClipboard(message.content, index)}
                        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200 p-1 rounded-full shadow-sm"
                        title="Copy message"
                      >
                        {copiedMessageId === index ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3 text-gray-600" />
                        )}
                      </button>
                    </div>
                    {message.timestamp && (
                      <p className="text-xs mt-3 text-gray-500 opacity-70">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="relative max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-3xl rounded-tr-md px-6 py-4 transition-all duration-200 hover:shadow-lg mr-3 shadow-md">
                    {/* Message Content */}
                    <div className="relative">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.timestamp && (
                      <p className="text-xs mt-3 text-blue-200 opacity-70">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    )}
                  </div>
                  
                  {/* User Avatar */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-white shadow-lg flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        {/* Typing Indicator */}
        {isLoading && (
          <div className="w-full px-6 animate-fade-in">
            <div className="flex items-start justify-start space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white shadow-lg flex items-center justify-center flex-shrink-0">
                {avatar.preview_image ? (
                  <img
                    src={avatar.preview_image}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Bot className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="bg-white border border-gray-100 rounded-3xl rounded-tl-md px-6 py-4 shadow-lg relative">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">{avatar.name} is typing...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-pink-50 border-t border-red-200 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2 shadow-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}

      {/*Input Area */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <div className="relative bg-white rounded-3xl border-2 border-gray-200 focus-within:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask ${avatar.name} anything...`}
                disabled={isLoading}
                className="w-full px-6 py-3 pr-14 bg-transparent border-0 rounded-3xl focus:outline-none disabled:opacity-50 text-gray-900 placeholder-gray-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2.5 rounded-full send-button focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed transition-all ${
                  inputMessage.trim() && !isLoading
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMode;