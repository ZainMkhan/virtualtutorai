import { useState, useCallback } from 'react';
import { conversationAPI, avatarAPI } from '@/services/api';
import type { Conversation, Message, AddMessageRequest } from '@/services/api';

interface UseConversationReturn {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createConversation: (avatarId?: string, title?: string) => Promise<string>;
  loadConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, senderType: 'user_input' | 'gemini' | 'heygen' | 'system', metadata?: Record<string, any>) => Promise<Message>;
  archiveConversation: () => Promise<void>;
  clearError: () => void;
}

export const useConversation = (): UseConversationReturn => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createConversation = useCallback(
    async (avatarId?: string, title?: string): Promise<string> => {
      try {
        setLoading(true);
        setError(null);

        const response = await conversationAPI.createConversation({
          avatar_id: avatarId,
          title,
        });

        if (response.success && response.data) {
          let conversationData = response.data;

          // If avatar exists but embed_url is missing, fetch full avatar data
          if (conversationData.avatar && !conversationData.avatar.embed_url && conversationData.avatar.id) {
            try {
              console.log('Fetching full avatar data for:', conversationData.avatar.id);
              const avatarResponse = await avatarAPI.getAvatar(conversationData.avatar.id);
              if (avatarResponse.success && avatarResponse.data) {
                conversationData.avatar = avatarResponse.data;
                console.log('Avatar data enriched with embed_url:', avatarResponse.data.embed_url);
              }
            } catch (avatarError) {
              console.warn('Failed to fetch full avatar data:', avatarError);
            }
          }

          setConversation(conversationData);
          setMessages(conversationData.messages || []);
          return conversationData.id;
        } else {
          throw new Error(response.message || 'Failed to create conversation');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to create conversation';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadConversation = useCallback(
    async (conversationId: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await conversationAPI.getConversation(conversationId);

        if (response.success && response.data) {
          let conversationData = response.data;

          // If avatar exists but embed_url is missing, fetch full avatar data
          if (conversationData.avatar && !conversationData.avatar.embed_url && conversationData.avatar.id) {
            try {
              console.log('Fetching full avatar data for:', conversationData.avatar.id);
              const avatarResponse = await avatarAPI.getAvatar(conversationData.avatar.id);
              if (avatarResponse.success && avatarResponse.data) {
                conversationData.avatar = avatarResponse.data;
                console.log('Avatar data enriched with embed_url:', avatarResponse.data.embed_url);
              }
            } catch (avatarError) {
              console.warn('Failed to fetch full avatar data:', avatarError);
            }
          }

          setConversation(conversationData);
          setMessages(conversationData.messages || []);
        } else {
          throw new Error(response.message || 'Failed to load conversation');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load conversation';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (content: string, senderType: 'user_input' | 'gemini' | 'heygen' | 'system' = 'user_input', metadata?: Record<string, any>) => {
      if (!conversation) {
        setError('No conversation loaded. Create or load a conversation first.');
        throw new Error('No conversation loaded');
      }

      try {
        setError(null);

        const messageData: AddMessageRequest = {
          role: senderType === 'user_input' ? 'user' : 'assistant',
          sender_type: senderType,
          content,
          metadata,
        };

        const response = await conversationAPI.addMessage(conversation.id, messageData);

        if (response.success && response.data) {
          // Add the new message to the messages list
          setMessages((prev) => [...prev, response.data]);
          
          // Update message count
          setConversation((prev) =>
            prev
              ? {
                  ...prev,
                  message_count: prev.message_count + 1,
                  last_message: content,
                  last_message_at: response.data.created_at,
                }
              : null
          );

          return response.data;
        } else {
          throw new Error(response.message || 'Failed to send message');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to send message';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [conversation]
  );

  const archiveConversation = useCallback(async () => {
    if (!conversation) {
      setError('No conversation loaded');
      throw new Error('No conversation loaded');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await conversationAPI.archiveConversation(conversation.id);

      if (response.success && response.data) {
        setConversation(null);
        setMessages([]);
      } else {
        throw new Error(response.message || 'Failed to archive conversation');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to archive conversation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [conversation]);

  return {
    conversation,
    messages,
    loading,
    error,
    createConversation,
    loadConversation,
    sendMessage,
    archiveConversation,
    clearError,
  };
};
