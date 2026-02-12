import React from 'react';
import { useTranslation } from 'react-i18next';
import Logo from '@/components/shared/Logo';
import ConversationList from './ConversationList';

interface ConversationSidebarProps {
  currentConversationId?: string;
  refreshTrigger: number;
  subscriptionTier: string;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  currentConversationId,
  refreshTrigger,
  subscriptionTier,
}) => {
  const { t } = useTranslation();
  return (
    <div className="w-64 border-r border-gray-200 flex flex-col">
      {/* Virtual Tutor Branding */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Logo size="md" />
          <div>
            <h2 className="text-sm font-bold text-gray-900">Virtual Tutor AI</h2>
            <p className="text-xs text-gray-500 capitalize">Plan: {subscriptionTier}</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder={t('conversation.search_conversations')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <ConversationList currentConversationId={currentConversationId} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default ConversationSidebar;
