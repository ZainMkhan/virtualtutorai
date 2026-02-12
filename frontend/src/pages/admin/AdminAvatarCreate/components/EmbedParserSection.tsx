import React, { useState } from 'react';
import { AlertCircle, Bot } from 'lucide-react';
import { parseHeyGenEmbed, generateAvatarId, suggestCategory, formatAvatarName, isValidEmbedSource } from '../../../../utils/embedParser';

interface EmbedParserSectionProps {
  onParseSuccess: (data: {
    name: string;
    avatar_id: string;
    embed_url: string;
    preview_image: string;
    quality: 'low' | 'medium' | 'high';
    transparent_background: boolean;
    category: string;
    metadata: Record<string, any>;
  }) => void;
}

const LIVEAVATAR_API_KEY = '4028e2c5-eac6-11f0-a99e-066a7fa2e369';

const parseLiveAvatarEmbed = async (embedScript: string) => {
  // Extract URL from iframe src
  const srcMatch = embedScript.match(/src=["']([^"']+)["']/);
  if (!srcMatch) {
    return { success: false, error: 'Could not find src attribute in LiveAvatar iframe' };
  }

  const embedUrl = srcMatch[1];
  // Extract avatar ID from URL - format: https://embed.liveavatar.com/v1/{AVATAR_ID}
  const idMatch = embedUrl.match(/\/v1\/([a-f0-9\-]+)(?:[?/]|$)/i);
  const liveAvatarId = idMatch ? idMatch[1] : generateAvatarId({ avatarName: 'LiveAvatar' });

  let previewUrl = '';
  let avatarName = '';

  // Fetch avatar metadata from LiveAvatar API
  try {
    const response = await fetch(`https://api.liveavatar.com/v1/avatars/${liveAvatarId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': LIVEAVATAR_API_KEY,
      }
    }).catch(() => null);
    
    if (response?.ok) {
      const result = await response.json();
      
      if (result.code === 100 && result.data) {
        const avatarData = result.data;
        
        // Get preview URL from response
        if (avatarData.preview_url) {
          previewUrl = avatarData.preview_url;
        }
        
        // Get avatar name from response
        if (avatarData.name) {
          avatarName = avatarData.name;
        }
        
        console.log('[LiveAvatar] Successfully fetched avatar metadata:', {
          id: avatarData.id,
          name: avatarData.name,
          status: avatarData.status,
          preview_url: avatarData.preview_url
        });
      }
    } else if (response) {
      const error = await response.json().catch(() => ({}));
      console.warn('[LiveAvatar] API error:', error);
    }
  } catch (error) {
    console.error('[LiveAvatar] Failed to fetch avatar metadata:', error);
  }

  // If we still don't have a preview URL, try constructing it
  if (!previewUrl) {
    previewUrl = `https://files2.heygen.ai/avatar/v3/${liveAvatarId}/preview_target.webp`;
  }

  // Set default name if not from API
  if (!avatarName) {
    avatarName = `Avatar ${liveAvatarId.substring(0, 8)}`;
  }

  return {
    success: true,
    data: {
      quality: 'high',
      avatarName: avatarName,
      previewImg: previewUrl,
      needRemoveBackground: false,
      embedUrl: embedUrl,
      originalData: { 
        type: 'liveavatar', 
        embedUrl, 
        liveAvatarId
      }
    }
  };
};

export const EmbedParserSection: React.FC<EmbedParserSectionProps> = ({ onParseSuccess }) => {
  const [embedScript, setEmbedScript] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [embedType, setEmbedType] = useState<'auto' | 'heygen' | 'liveavatar'>('auto');

  const handleParseEmbed = async () => {
    if (!embedScript.trim()) {
      setParseError('Please paste an embed script first');
      return;
    }

    if (!isValidEmbedSource(embedScript)) {
      setParseError('Embed script must be from a trusted source (HeyGen or LiveAvatar)');
      return;
    }

    setParsing(true);
    setParseError(null);

    try {
      // Determine embed type
      const isLiveAvatar = embedScript.includes('liveavatar.com');
      const isHeyGen = embedScript.includes('heygen.com') || embedScript.includes('streaming-embed');

      let parseResult: any;

      if (isLiveAvatar || embedType === 'liveavatar') {
        parseResult = await parseLiveAvatarEmbed(embedScript);
      } else if (isHeyGen || embedType === 'heygen') {
        parseResult = parseHeyGenEmbed(embedScript);
      } else {
        setParseError('Could not determine embed type. Please specify manually.');
        return;
      }

      if (!parseResult.success) {
        setParseError(parseResult.error || 'Failed to parse embed script');
        return;
      }

      const parsedData = parseResult.data!;

      const formattedData = {
        name: formatAvatarName(parsedData.avatarName),
        avatar_id: generateAvatarId(parsedData),
        embed_url: embedScript.trim(),
        preview_image: parsedData.previewImg || '',
        quality: (parsedData.quality as 'low' | 'medium' | 'high') || 'medium',
        transparent_background: !parsedData.needRemoveBackground,
        category: suggestCategory(parsedData.avatarName),
        metadata: parsedData.originalData || {}
      };

      onParseSuccess(formattedData);
      setSuccessMessage('Embed script parsed successfully! Review the details below and save.');
    } catch (error) {
      setParseError('Unexpected error while parsing embed script');
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Step 1: Parse Embed Script</h2>
        <p className="text-sm text-gray-600 mt-1">Paste your avatar embed script below to automatically extract avatar information (supports HeyGen and LiveAvatar)</p>
      </div>

      <div className="p-6 space-y-4">
        {parseError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>{parseError}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="embedType" className="block text-sm font-medium text-gray-700 mb-2">
              Embed Type (Auto-detect)
            </label>
            <select
              id="embedType"
              value={embedType}
              onChange={(e) => setEmbedType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="auto">Auto-detect</option>
              <option value="heygen">HeyGen</option>
              <option value="liveavatar">LiveAvatar</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="embedScript" className="block text-sm font-medium text-gray-700 mb-2">
            Embed Script
          </label>
          <textarea
            id="embedScript"
            value={embedScript}
            onChange={(e) => setEmbedScript(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Paste your embed script here. Examples:&#10;HeyGen: &lt;script&gt; or full script&#10;LiveAvatar: &lt;iframe src=&quot;https://embed.liveavatar.com/...&quot; ... /&gt;"
          />
          <p className="text-xs text-gray-500 mt-2">
            <strong>HeyGen:</strong> Paste the complete script tag<br/>
            <strong>LiveAvatar:</strong> Paste the iframe tag
          </p>
        </div>

        <button
          type="button"
          onClick={handleParseEmbed}
          disabled={parsing || !embedScript.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {parsing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Parsing...</span>
            </>
          ) : (
            <>
              <Bot className="h-4 w-4" />
              <span>Parse Embed Script</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
