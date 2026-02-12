import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Message } from '@/services/api';
import { AlertCircle } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  instructorName?: string;
  instructorImage?: string;
  userName?: string;
  userImage?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  instructorName,
  instructorImage,
  userName,
  userImage,
}) => {
  const { t } = useTranslation();
  const isUser = message.role === 'user';
  const displayName = isUser ? (userName || t('conversation.you')) : (instructorName || t('conversation.instructor'));
  const displayUserImage = isUser ? userImage : instructorImage;
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const avatarBgColor = isUser
    ? 'from-blue-400 to-blue-600'
    : 'from-green-400 to-green-600';

  // Extract image data from metadata
  const imageBase64 = message.metadata?.image_base64;
  const imageUrl = message.metadata?.image_url;
  const imageAlt = message.metadata?.image_alt || 'Attached image';
  const imageCaption = message.metadata?.image_caption;
  const [imageError, setImageError] = React.useState(false);

  // Use Base64 if available, otherwise fall back to URL
  const displayImage = imageBase64 || imageUrl;

  return (
    <div className={`flex gap-3 mb-5 items-flex-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar - aligned with message bubble */}
      <div className="flex-shrink-0" style={{ marginTop: 'auto' }}>
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarBgColor} flex items-center justify-center overflow-hidden flex-shrink-0`}>
          {displayUserImage ? (
            <img
              src={displayUserImage}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-white text-xs font-bold">{avatarInitial}</span>
          )}
        </div>
      </div>

      {/* Message Group */}
      <div className={`flex flex-col gap-0.5 flex-1 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Name */}
        <span className={`text-xs font-semibold px-2 ${isUser ? 'text-blue-600' : 'text-gray-700'}`}>
          {displayName}
        </span>

        {/* Message Bubble */}
        <div
          className={`px-4 py-2.5 rounded-xl max-w-4xl ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-900 rounded-bl-none'
          }`}
        >
          {/* Image Display from Metadata */}
          {displayImage && !imageError && (
            <div className="mb-3 -mx-4 -my-2.5 -mt-2.5">
              <img
                src={displayImage}
                alt={imageAlt}
                className="max-w-sm rounded-t-xl border border-gray-300 w-full object-cover"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            </div>
          )}

          {/* Image Error State */}
          {displayImage && imageError && (
            <div className="mb-3 bg-red-100 border border-red-300 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700">{t('conversation.failed_to_load_image')}</span>
            </div>
          )}

          {/* Message Text */}
          <p className="text-sm break-words leading-relaxed whitespace-pre-wrap">{message.content}</p>

          {/* Image Caption */}
          {imageCaption && (
            <p className="text-xs mt-2 opacity-75 italic">{imageCaption}</p>
          )}
        </div>

        {/* Timestamp - below bubble */}
        <span className={`text-xs px-2 ${isUser ? 'text-gray-500' : 'text-gray-500'}`}>
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;

