import React, { useEffect, useRef, useState } from 'react';
import { Bot } from 'lucide-react';
import type { Avatar } from '../../../services/api';

interface AvatarModeProps {
  avatar: Avatar;
  isActive: boolean;
}

const HEYGEN_HOST = "https://labs.heygen.com";

const AvatarMode: React.FC<AvatarModeProps> = ({ avatar, isActive }) => {
  const embedContainerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedEmbed = useRef(false);

  useEffect(() => {
    if (isActive && !hasLoadedEmbed.current && avatar.embed_url && embedContainerRef.current) {
      loadAvatarEmbed();
      hasLoadedEmbed.current = true;
    }
  }, [isActive, avatar.embed_url]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (embedContainerRef.current) {
        embedContainerRef.current.innerHTML = '';
      }
      hasLoadedEmbed.current = false;
    };
  }, [isActive]);

  const extractHeyGenUrl = (embedUrl: string): string | null => {
    // Try to extract the share URL from the embed script
    const urlMatch = embedUrl.match(/url=host\+"([^"]+)"/);
    if (urlMatch) {
      return HEYGEN_HOST + urlMatch[1];
    }
    
    // If that doesn't work, try to find the direct URL pattern
    const directMatch = embedUrl.match(/https:\/\/labs\.heygen\.com\/guest\/streaming-embed[^"'\s]+/);
    if (directMatch) {
      return directMatch[0];
    }
    
    return null;
  };

  const loadAvatarEmbed = () => {
    if (!embedContainerRef.current || !avatar.embed_url) return;

    const targetContainer = embedContainerRef.current;
    
    // Clear any previous instances
    targetContainer.innerHTML = '';
    setIsLoading(true);

    // Extract the HeyGen URL from the embed script
    const heygenUrl = extractHeyGenUrl(avatar.embed_url);
    
    if (!heygenUrl) {
      console.error('Could not extract HeyGen URL from embed script');
      setIsLoading(false);
      return;
    }

    const wrapDiv = document.createElement("div");
    wrapDiv.id = "heygen-streaming-embed";
    wrapDiv.style.cssText = "width: 100%; height: 100%; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: black;";

    const videoContainer = document.createElement("div");
    videoContainer.id = "heygen-streaming-container";
    videoContainer.style.cssText = "width: 100%; height: 100%; position: relative; display: flex; flex-direction: column; flex: 1;";

    const stylesheet = document.createElement("style");
    stylesheet.innerHTML = `
      #heygen-streaming-embed {
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
        border-radius: 1rem !important;
        border: none !important;
        box-shadow: none !important;
        z-index: 1 !important;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease-in-out;
      }

      #heygen-streaming-embed.show {
        opacity: 1 !important;
        visibility: visible !important;
      }

      #heygen-streaming-embed.expand {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100% !important;
        border-radius: 1rem !important;
        transform: none !important;
      }

      #heygen-streaming-container {
        width: 100% !important;
        height: 100% !important;
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        border-radius: 1rem !important;
        overflow: hidden !important;
        position: relative !important;
      }

      #heygen-streaming-container iframe {
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
      #heygen-streaming-container iframe body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
      }
      
      /* Ensure video content fills the container */
      #heygen-streaming-container video,
      #heygen-streaming-container canvas {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
        object-position: center !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
      }

      /* Override any HeyGen specific size constraints */
      #heygen-streaming-container * {
        max-width: 100% !important;
        max-height: 100% !important;
        box-sizing: border-box !important;
      }

      /* Force full container usage */
      .heygen-streaming-embed,
      .streaming-embed-container {
        width: 100% !important;
        height: 100% !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
      }

      /* Prevent scrolling and ensure proper fit */
      #heygen-streaming-embed,
      #heygen-streaming-container {
        overflow: hidden !important;
        scroll-behavior: smooth !important;
      }

      /* Handle any buttons or UI elements */
      #heygen-streaming-container button,
      #heygen-streaming-container .chat-button,
      #heygen-streaming-container [role="button"] {
        position: absolute !important;
        bottom: 20px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        z-index: 1000 !important;
      }
    `;

    const iframe = document.createElement("iframe");
    iframe.allowFullscreen = false;
    iframe.title = "Streaming Embed";
    iframe.role = "dialog";
    iframe.allow = "microphone";
    iframe.src = heygenUrl;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin === HEYGEN_HOST && event.data?.type === "streaming-embed") {
        switch (event.data.action) {
          case "init":
            wrapDiv.classList.add("show");
            setIsLoading(false);
            break;
        }
      }
    };

    window.addEventListener("message", handleMessage);

    videoContainer.appendChild(iframe);
    wrapDiv.appendChild(stylesheet);
    wrapDiv.appendChild(videoContainer);
    targetContainer.appendChild(wrapDiv);
  };



  if (!isActive) {
    return null;
  }

  return (
    <div className="w-full flex flex-col" style={{ height: '100%', minHeight: '100%' }}>
      {/* Avatar Info Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {avatar.preview_image ? (
              <img
                src={avatar.preview_image}
                alt={avatar.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Bot className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{avatar.name}</h2>
            <p className="text-sm text-gray-600">{avatar.category} • {avatar.quality} quality</p>
          </div>
        </div>
      </div>

      {/* Avatar Container */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-blue-50 p-6" style={{ minHeight: 'calc(100vh - 12rem)' }}>
        {avatar.embed_url ? (
          <div 
            className="w-full bg-black rounded-2xl relative mx-auto"
            style={{ 
              height: 'calc(100vh - 16rem)',
              maxWidth: 'calc((100vh - 16rem) * 16 / 9)',
              aspectRatio: '16/9'
            }}
            aria-live="polite"
            role="region"
            aria-label="HeyGen Avatar"
          >
            <div ref={embedContainerRef} className="w-full h-full absolute inset-0" />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center h-full text-gray-400">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-lg">Initializing Avatar...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-white rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Avatar Configured</h3>
              <p className="text-gray-600">
                This avatar doesn't have an embed URL configured yet. Contact your administrator to set up the avatar.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarMode;