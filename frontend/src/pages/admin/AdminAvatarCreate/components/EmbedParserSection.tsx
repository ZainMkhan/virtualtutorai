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

export const EmbedParserSection: React.FC<EmbedParserSectionProps> = ({ onParseSuccess }) => {
  const [embedScript, setEmbedScript] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleParseEmbed = async () => {
    if (!embedScript.trim()) {
      setParseError('Please paste an embed script first');
      return;
    }

    if (!isValidEmbedSource(embedScript)) {
      setParseError('Embed script must be from a trusted source (HeyGen)');
      return;
    }

    setParsing(true);
    setParseError(null);

    try {
      const parseResult = parseHeyGenEmbed(embedScript);
      
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
        <p className="text-sm text-gray-600 mt-1">Paste your HeyGen embed script below to automatically extract avatar information</p>
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
            placeholder="Paste your HeyGen embed script here..."
          />
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
