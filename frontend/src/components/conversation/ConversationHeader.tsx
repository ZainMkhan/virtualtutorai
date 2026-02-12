import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play } from 'lucide-react';
import { geminiService } from '@/services/gemini';
import type { Message } from '@/services/api';

interface ConversationHeaderProps {
  conversationTitle: string;
  onBack: () => void;
  onNewChat: () => void;
  conversation?: any;
  messages?: Message[];
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversationTitle,
  onBack,
  onNewChat,
  conversation,
  messages = [],
}) => {
  const { t } = useTranslation();
  const [showInteractiveSession, setShowInteractiveSession] = useState(false);
  const [conversationSummary, setConversationSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const avatarData = conversation?.avatar;
  const embedUrl = avatarData?.embed_url;
  const name = avatarData?.name;
  const hasAvatar = !!(avatarData && (avatarData.embed_url || avatarData.name));

  React.useEffect(() => {
    console.log('ConversationHeader - Full props:', {
      conversationTitle,
      conversationAvatar: conversation?.avatar,
      hasConversation: !!conversation
    });
    console.log('ConversationHeader - Derived data:', { 
      name, 
      embedUrl, 
      hasAvatar,
      avatarId: avatarData?.id,
      avatarComplete: !!avatarData?.embed_url
    });
  }, [name, embedUrl, conversation?.avatar, conversationTitle, avatarData]);

  const handleStartInteractiveSession = async () => {
    console.log('Start Interactive Session clicked. Avatar:', { name, embedUrl, hasAvatar, avatarId: avatarData?.id });
    
    if (!avatarData) {
      alert(t('conversation.no_instructor'));
      return;
    }
    
    if (!embedUrl) {
      console.warn('Avatar data present but embed_url missing:', avatarData);
      alert(t('conversation.video_setup_incomplete'));
      return;
    }
    
    // Generate conversation summary if there are messages
    if (messages.length > 0 && !conversationSummary) {
      setSummaryLoading(true);
      try {
        const chatMessages = messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        }));
        
        const summaryResponse = await geminiService.summarizeConversation(chatMessages, {
          name: avatarData.name,
          category: avatarData.category,
        });
        
        if (summaryResponse.success && summaryResponse.data?.response) {
          console.log('Conversation summary:', summaryResponse.data.response);
          setConversationSummary(summaryResponse.data.response);
        }
      } catch (error) {
        console.error('Failed to generate summary:', error);
        setConversationSummary('Unable to generate summary, but proceeding with interactive session.');
      } finally {
        setSummaryLoading(false);
      }
    }
    
    // Avatar is available and has embed_url, directly open the interactive session
    setShowInteractiveSession(true);
  };
  return (
    <>
      {/* Interactive Session Modal */}
      {showInteractiveSession && (
        <>
          {/* Modal Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowInteractiveSession(false)}
          />
          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[90vh] flex flex-col pointer-events-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900">
                  Interactive Session with {name || 'Avatar'}
                </h2>
                <button
                  onClick={() => setShowInteractiveSession(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-hidden bg-black rounded-lg m-4 relative">
                <InteractiveSessionEmbed 
                  embedUrl={embedUrl || ''}
                  onClose={() => setShowInteractiveSession(false)}
                  conversationSummary={conversationSummary}
                  summaryLoading={summaryLoading}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">
            {conversationTitle}
          </h1>
        </div>
        
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleStartInteractiveSession}
            disabled={!hasAvatar}
            className={`rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition-all ${
              hasAvatar
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-400 cursor-not-allowed text-white'
            }`}
            title={hasAvatar ? t('conversation.start_video_session') : t('conversation.no_instructor_selected')}
          >
            <Play className="h-4 w-4" />
            {t('conversation.video_chat')}
          </Button>
          <Button
            type="button"
            onClick={onNewChat}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm flex items-center gap-2"
          >
            ✨ {t('conversation.new_chat')}
          </Button>
        </div>
      </div>
    </>
  );
};

// Interactive Session Embed Component
const InteractiveSessionEmbed: React.FC<{
  embedUrl: string;
  onClose: () => void;
  conversationSummary?: string | null;
  summaryLoading?: boolean;
}> = ({ embedUrl, onClose, conversationSummary, summaryLoading = false }) => {
  const embedContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const hasLoadedEmbed = React.useRef(false);
  const messageHandlerRef = React.useRef<((event: MessageEvent) => void) | null>(null);
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const HEYGEN_HOST = "https://labs.heygen.com";

  React.useEffect(() => {
    if (!hasLoadedEmbed.current && embedUrl && embedContainerRef.current) {
      loadHeyGenEmbed();
      hasLoadedEmbed.current = true;
    }

    return () => {
      // Cleanup on unmount
      if (embedContainerRef.current) {
        embedContainerRef.current.innerHTML = '';
      }
      if (messageHandlerRef.current) {
        window.removeEventListener("message", messageHandlerRef.current);
      }
      hasLoadedEmbed.current = false;
    };
  }, [embedUrl]);

  // Send conversation summary to HeyGen when ready
  React.useEffect(() => {
    if (conversationSummary && iframeRef.current && !summaryLoading) {
      console.log('Sending conversation summary to HeyGen:', conversationSummary);
      try {
        // Send message to HeyGen iframe with conversation context
        iframeRef.current.contentWindow?.postMessage(
          {
            type: 'conversation-summary',
            data: {
              summary: conversationSummary,
              timestamp: new Date().toISOString(),
            }
          },
          HEYGEN_HOST
        );
      } catch (error) {
        console.error('Failed to send summary to HeyGen:', error);
      }
    }
  }, [conversationSummary, summaryLoading]);

  const extractHeyGenUrl = (embedUrlStr: string): string | null => {
    const urlMatch = embedUrlStr.match(/url=host\+"([^"]+)"/);
    if (urlMatch) {
      return HEYGEN_HOST + urlMatch[1];
    }

    const directMatch = embedUrlStr.match(/https:\/\/labs\.heygen\.com\/guest\/streaming-embed[^"'\s]+/);
    if (directMatch) {
      return directMatch[0];
    }

    return null;
  };

  const loadHeyGenEmbed = () => {
    if (!embedContainerRef.current || !embedUrl) {
      setError('No embed URL provided');
      setIsLoading(false);
      return;
    }

    const targetContainer = embedContainerRef.current;
    targetContainer.innerHTML = '';
    setIsLoading(true);
    setError(null);

    const heygenUrl = extractHeyGenUrl(embedUrl);

    if (!heygenUrl) {
      console.error('Could not extract HeyGen URL from embed script');
      setError('Failed to initialize video. Invalid embed URL.');
      setIsLoading(false);
      return;
    }

    const wrapDiv = document.createElement("div");
    wrapDiv.id = "heygen-interactive-embed";
    wrapDiv.style.cssText = "width: 100%; height: 100%; position: absolute; top: 0; left: 0; right: 0; bottom: 0;";

    const videoContainer = document.createElement("div");
    videoContainer.id = "heygen-interactive-container";
    videoContainer.style.cssText = "width: 100%; height: 100%; position: relative; display: flex; flex-direction: column; flex: 1;";

    const stylesheet = document.createElement("style");
    stylesheet.innerHTML = `
      #heygen-interactive-embed {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: stretch !important;
        align-items: stretch !important;
        overflow: hidden !important;
        border-radius: 0.5rem !important;
        border: none !important;
        box-shadow: none !important;
        z-index: 1 !important;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease-in-out;
      }

      #heygen-interactive-embed.show {
        opacity: 1 !important;
        visibility: visible !important;
      }

      #heygen-interactive-embed.expand {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100% !important;
        border-radius: 0.5rem !important;
        transform: none !important;
      }

      #heygen-interactive-container {
        width: 100% !important;
        height: 100% !important;
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        border-radius: 0.5rem !important;
        overflow: hidden !important;
        position: relative !important;
      }

      #heygen-interactive-container iframe {
        width: 100% !important;
        height: 100% !important;
        flex: 1 !important;
        border: 0 !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        object-fit: contain !important;
        object-position: center !important;
      }

      /* Force HeyGen's internal content to fill */
      #heygen-interactive-container iframe body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
      }
      
      /* Ensure video content fills the container */
      #heygen-interactive-container video,
      #heygen-interactive-container canvas {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
        object-position: center !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
      }

      /* Override any HeyGen specific size constraints */
      #heygen-interactive-container * {
        max-width: 100% !important;
        max-height: 100% !important;
        box-sizing: border-box !important;
      }

      /* Force full container usage */
      .heygen-interactive-embed,
      .interactive-embed-container {
        width: 100% !important;
        height: 100% !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
      }

      /* Prevent scrolling and ensure proper fit */
      #heygen-interactive-embed,
      #heygen-interactive-container {
        overflow: hidden !important;
        scroll-behavior: smooth !important;
      }

      /* Handle any buttons or UI elements */
      #heygen-interactive-container button,
      #heygen-interactive-container .chat-button,
      #heygen-interactive-container [role="button"] {
        position: absolute !important;
        bottom: 20px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        z-index: 1000 !important;
      }
    `;

    const iframe = document.createElement("iframe");
    iframe.allowFullscreen = false;
    iframe.title = "HeyGen Interactive Session";
    iframe.role = "dialog";
    iframe.allow = "microphone";
    iframe.src = heygenUrl;
    
    // Store iframe reference for later communication
    iframeRef.current = iframe;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin === HEYGEN_HOST && event.data?.type === "streaming-embed") {
        switch (event.data.action) {
          case "init":
            wrapDiv.classList.add("show");
            setIsLoading(false);
            setError(null);
            break;
          case "error":
            console.error('HeyGen error:', event.data.error);
            setError('Video session error. Please try again.');
            break;
        }
      }
    };

    messageHandlerRef.current = handleMessage;
    window.addEventListener("message", handleMessage);

    videoContainer.appendChild(iframe);
    wrapDiv.appendChild(stylesheet);
    wrapDiv.appendChild(videoContainer);
    targetContainer.appendChild(wrapDiv);
  };

  return (
    <div className="w-full h-full relative bg-black">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              onClick={onClose}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div ref={embedContainerRef} className="w-full h-full" />
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <svg className="animate-spin mx-auto mb-3 h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg">Initializing Interactive Session...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationHeader;
