import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { conversationAPI } from '@/services/api';
import type { Conversation } from '@/services/api';
import { Loader, Trash2 } from 'lucide-react';

interface ConversationListProps {
  onSelectConversation?: (conversationId: string) => void;
  currentConversationId?: string;
  refreshTrigger?: number; // External trigger to refresh the list
}

const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  currentConversationId,
  refreshTrigger,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await conversationAPI.listConversations(1, 10);

        if (response.success) {
          setConversations(response.data.results);
        } else {
          setError(response.message || 'Failed to load conversations');
        }
      } catch (err: any) {
        console.error('Failed to load conversations:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [refreshTrigger]);

  const handleSelectConversation = (conversationId: string) => {
    if (onSelectConversation) {
      onSelectConversation(conversationId);
    } else {
      navigate(`/conversation/${conversationId}`);
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm(t('conversation.delete_conversation_confirm'))) {
      return;
    }

    try {
      await conversationAPI.archiveConversation(conversationId);
      setConversations(conversations.filter((c) => c.id !== conversationId));
    } catch (err: any) {
      console.error('Failed to delete conversation:', err);
      setError('Failed to delete conversation');
    }
  };

  // Group conversations by date
  const groupConversationsByDate = (convos: Conversation[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const grouped: {
      today: Conversation[];
      yesterday: Conversation[];
      older: Conversation[];
    } = {
      today: [],
      yesterday: [],
      older: [],
    };

    convos.forEach((convo) => {
      const convoDate = new Date(convo.created_at || new Date());
      convoDate.setHours(0, 0, 0, 0);

      if (convoDate.getTime() === today.getTime()) {
        grouped.today.push(convo);
      } else if (convoDate.getTime() === yesterday.getTime()) {
        grouped.yesterday.push(convo);
      } else {
        grouped.older.push(convo);
      }
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader className="h-4 w-4 animate-spin text-gray-600" />
      </div>
    );
  }

  const grouped = groupConversationsByDate(conversations);
  const hasConversations =
    grouped.today.length > 0 || grouped.yesterday.length > 0 || grouped.older.length > 0;

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2">
        {error && (
          <div className="m-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        {!hasConversations ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-sm text-gray-600">{t('conversation.no_conversations_yet')}</p>
            <p className="text-xs text-gray-500 mt-1">{t('conversation.start_new_chat_to_begin')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Today Section */}
            {grouped.today.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">{t('conversation.today')}</h3>
                <div className="space-y-1">
                  {grouped.today.map((convo) => (
                    <button
                      key={convo.id}
                      onClick={() => handleSelectConversation(convo.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors group ${
                        currentConversationId === convo.id
                          ? 'bg-blue-100 text-blue-900'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate break-words">
                            {convo.last_message || convo.title || 'Untitled'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteConversation(convo.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 flex-shrink-0 p-1 transition-opacity"
                          title="Delete conversation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Yesterday Section */}
            {grouped.yesterday.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">
                  {t('conversation.yesterday')}
                </h3>
                <div className="space-y-1">
                  {grouped.yesterday.map((convo) => (
                    <button
                      key={convo.id}
                      onClick={() => handleSelectConversation(convo.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors group ${
                        currentConversationId === convo.id
                          ? 'bg-blue-100 text-blue-900'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate break-words">
                            {convo.last_message || convo.title || 'Untitled'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteConversation(convo.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 flex-shrink-0 p-1 transition-opacity"
                          title="Delete conversation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Older Section */}
            {grouped.older.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">{t('conversation.older')}</h3>
                <div className="space-y-1">
                  {grouped.older.map((convo) => (
                    <button
                      key={convo.id}
                      onClick={() => handleSelectConversation(convo.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors group ${
                        currentConversationId === convo.id
                          ? 'bg-blue-100 text-blue-900'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate break-words">
                            {convo.last_message || convo.title || 'Untitled'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteConversation(convo.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 flex-shrink-0 p-1 transition-opacity"
                          title="Delete conversation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
