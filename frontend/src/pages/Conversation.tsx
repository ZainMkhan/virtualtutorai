import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useConversation } from '@/hooks/useConversation';
import { useAuth } from '@/contexts/AuthContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { geminiService } from '@/services/gemini';
import { canSendMessage, canCreateConversation, canUseInteractiveAvatar, formatLimitWarning } from '@/utils/limitChecker';
import { LimitWarningBanner } from '@/components/shared/LimitWarnings';
import { type UploadedFile } from '@/components/shared/FileUpload';
import InstructorSelector from '@/components/conversation/InstructorSelector';
import ConversationHeader from '@/components/conversation/ConversationHeader';
import ConversationSidebar from '@/components/conversation/ConversationSidebar';
import MessagesArea from '@/components/conversation/MessagesArea';
import MessageInput from '@/components/conversation/MessageInput';

const ConversationPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, currentSubscription, usageData, refreshUsageData } = useAuth();
  const { conversation, messages, error, createConversation, loadConversation, sendMessage, clearError } = useConversation();

  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showInstructorSelector, setShowInstructorSelector] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [conversationListRefresh, setConversationListRefresh] = useState(0);
  const [attachedFile, setAttachedFile] = useState<UploadedFile | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Speech Recognition Hook
  const {
    isListening,
    isSupported: isSpeechSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ language: 'en-US' });

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputValue((prev) => prev + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // Auto-scroll to latest message - with timeout to ensure DOM is updated
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        setTimeout(() => {
          messagesContainerRef.current?.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }, 0);
      }
    };

    scrollToBottom();
  }, [messages, isSending]);

  // Initialize conversation on mount or when conversationId changes
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const initConversation = async () => {
      try {
        clearError();
        setLocalError(null);
        setInputValue(''); // Clear input when switching conversations

        if (conversationId) {
          // Load existing conversation
          await loadConversation(conversationId);
        } else {
          // No conversationId - show instructor selector to create new conversation
          setShowInstructorSelector(true);
        }
      } catch (err: any) {
        setLocalError(err.message || t('conversation.failed_to_initialize_conversation'));
      }
    };

    initConversation();
  }, [conversationId, user, navigate, loadConversation, clearError]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() && !attachedFile) {
      return;
    }

    // Check message limit before sending
    if (usageData) {
      const messageCheckResult = canSendMessage(
        usageData.messages_sent,
        usageData.messages_limit
      );

      if (!messageCheckResult.canProceed) {
        setLocalError(formatLimitWarning(messageCheckResult));
        return;
      }

      // Warn if close to limit but allow
      if (messageCheckResult.percentageUsed >= 70) {
        const warning = formatLimitWarning(messageCheckResult);
        console.warn('⚠️ Usage Warning:', warning);
      }
    }

    let userMessage = inputValue.trim();
    setInputValue('');
    const fileToSend = attachedFile;
    setAttachedFile(null);
    setShowFileUpload(false);
    setIsSending(true);
    setLocalError(null);

    try {
      let currentConversation = conversation;

      // If no conversation exists yet, create one on first message
      if (!currentConversation) {
        // Check conversation limit before creating
        if (usageData) {
          const conversationCheckResult = canCreateConversation(
            usageData.conversations_used || 0,
            usageData.conversations_limit || 0
          );

          if (!conversationCheckResult.canProceed) {
            setLocalError(formatLimitWarning(conversationCheckResult));
            setIsSending(false);
            return;
          }
        }

        const newConversationId = await createConversation();
        navigate(`/conversation/${newConversationId}`, { replace: true });
        return;
      }

      // If only image is sent (no text), use a default message
      if (!userMessage && fileToSend) {
        userMessage = `See attached image: ${fileToSend.name}`;
      }

      // Add user message with image Base64 in metadata if applicable
      const userMessageMetadata = fileToSend?.type.startsWith('image/') ? {
        image_base64: fileToSend.base64,
        image_alt: fileToSend?.name || 'User uploaded image',
        image_type: 'user_upload',
        image_mime_type: fileToSend.type,
      } : undefined;

      await sendMessage(userMessage, 'user_input', userMessageMetadata);

      // Get AI response from Gemini (with optional file)
      try {
        const aiResponse = await geminiService.sendMessage([
          ...messages.map(m => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content,
          })),
          { role: 'user' as const, content: userMessage },
        ], currentConversation.avatar ? {
          name: (currentConversation.avatar as any).name || 'Avatar',
          category: (currentConversation.avatar as any).category || 'general',
        } : undefined,
        fileToSend ? {
          mimeType: fileToSend.type,
          data: fileToSend.base64,
          name: fileToSend.name,
        } : undefined);
        
        // Add AI response to conversation
        if (aiResponse.success && aiResponse.data?.response) {
          await sendMessage(aiResponse.data.response, 'gemini');
        }
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError);
        setLocalError(t('conversation.failed_to_get_ai_response'));
      }
      
      // Refresh usage data and conversation list
      refreshUsageData();
      setConversationListRefresh(prev => prev + 1);
    } catch (err: any) {
      setLocalError(err.message || t('conversation.failed_to_send_message'));
    } finally {
      setIsSending(false);
    }
  };

  const handleNewConversation = () => {
    setShowInstructorSelector(true);
  };

  const handleInstructorSelect = async (avatarId: string | null) => {
    try {
      setShowInstructorSelector(false);
      setIsCreatingConversation(true);
      const newConversationId = await createConversation(avatarId || undefined);
      navigate(`/conversation/${newConversationId}`, { replace: true });
    } catch (err: any) {
      setLocalError(err.message || t('conversation.failed_to_create_conversation'));
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleInstructorCancel = () => {
    setShowInstructorSelector(false);
  };

  return (
    <>
      {/* Instructor Selector Modal */}
      {showInstructorSelector && (
        <InstructorSelector
          onSelect={handleInstructorSelect}
          onCancel={handleInstructorCancel}
          isLoading={isCreatingConversation}
        />
      )}

      <div className="flex h-screen bg-white">
      {/* Sidebar - Conversations List */}
      <ConversationSidebar
        currentConversationId={conversationId}
        refreshTrigger={conversationListRefresh}
        subscriptionTier={currentSubscription?.tierName || 'Free'}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <ConversationHeader
          conversationTitle={conversation?.title || t('conversation.new_conversation')}
          onBack={() => navigate('/dashboard')}
          onNewChat={handleNewConversation}
          conversation={conversation}
          messages={messages}
        />

        {/* Messages Area - Takes up remaining space */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Limit Warning Banner */}
          {usageData && (
            <LimitWarningBanner
              messagesSent={usageData.messages_sent}
              messagesLimit={usageData.messages_limit}
              conversationsUsed={usageData.conversations_used || 0}
              conversationsLimit={usageData.conversations_limit || 0}
              interactiveMinutesUsed={usageData.interactive_minutes_used}
              interactiveMinutesLimit={usageData.interactive_minutes_limit}
            />
          )}

          <MessagesArea
            messages={messages}
            isSending={isSending}
            instructorName={(conversation?.avatar as any)?.name}
            instructorImage={(conversation?.avatar as any)?.preview_image}
            userName={user?.name || 'User'}
            userImage={user ? '' : undefined}
            messagesContainerRef={messagesContainerRef}
            messagesEndRef={messagesEndRef}
          />

          {/* Error Message - only show if there's an error */}
          {(error || localError) && (
            <div className="px-6 py-3 bg-red-50 border-l-4 border-red-400 flex-shrink-0">
              <p className="text-sm text-red-700">{error || localError}</p>
            </div>
          )}
        </div>

        {/* Message Input - Stays at bottom */}
        <MessageInput
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSubmit={handleSendMessage}
          isSending={isSending}
          attachedFile={attachedFile}
          showFileUpload={showFileUpload}
          onFileSelect={(file) => {
            setAttachedFile(file);
            setShowFileUpload(false);
          }}
          onToggleFileUpload={setShowFileUpload}
          onRemoveFile={() => setAttachedFile(null)}
          isListening={isListening}
          isSpeechSupported={isSpeechSupported}
          onStartListening={startListening}
          onStopListening={stopListening}
          interimTranscript={interimTranscript}
        />
      </div>
    </div>
    </>
  );
};

export default ConversationPage;
