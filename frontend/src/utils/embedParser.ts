// Utility for parsing HeyGen embed scripts and extracting avatar data

export interface ParsedEmbedData {
  quality?: string;
  avatarName?: string;
  previewImg?: string;
  needRemoveBackground?: boolean;
  knowledgeBaseId?: string;
  username?: string;
  embedUrl?: string;
  originalData?: Record<string, any>;
}

export interface EmbedParseResult {
  success: boolean;
  data?: ParsedEmbedData;
  error?: string;
}

/**
 * Parses a HeyGen embed script to extract avatar information
 * @param embedScript - The full embed script HTML
 * @returns Parsed avatar data or error
 */
export function parseHeyGenEmbed(embedScript: string): EmbedParseResult {
  try {
    // Normalize the input - remove line breaks and extra whitespace
    const normalizedScript = embedScript.replace(/\s+/g, ' ').trim();

    // Multiple patterns to extract the URL - handle different script formats
    const urlPatterns = [
      // Pattern 1: host+"path" or host+'path'
      /host\s*\+\s*["']([^"']+)["']/,
      // Pattern 2: Direct URL assignment
      /url\s*=\s*["']([^"']+)["']/,
      // Pattern 3: Full URL in src attribute
      /src\s*=\s*["']([^"']*heygen[^"']+)["']/,
      // Pattern 4: URL construction with template literals
      /url\s*=\s*host\s*\+\s*["']([^"']+)["']/,
      // Pattern 5: Fallback - any heygen URL
      /["'](https:\/\/[^"']*heygen[^"']+)["']/
    ];

    let embedPath = '';
    let fullUrl = '';
    let urlMatch: RegExpMatchArray | null = null;

    // Try each pattern
    for (const pattern of urlPatterns) {
      urlMatch = normalizedScript.match(pattern);
      if (urlMatch) {
        if (urlMatch[1].startsWith('http')) {
          // Full URL found
          fullUrl = urlMatch[1];
          embedPath = fullUrl.replace(/^https?:\/\/[^/]+/, '');
        } else {
          // Path found, construct full URL
          embedPath = urlMatch[1];
          fullUrl = `https://labs.heygen.com${embedPath}`;
        }
        break;
      }
    }

    if (!urlMatch || !embedPath) {
      return { success: false, error: 'Could not find embed URL in script. Please ensure this is a valid HeyGen embed script.' };
    }

    // Extract the share parameter with multiple patterns
    const sharePatterns = [
      /share=([^&]+)/,
      /share%3D([^&%]+)/,
      /"share":\s*"([^"]+)"/
    ];

    let shareParam = '';
    for (const pattern of sharePatterns) {
      const shareMatch = embedPath.match(pattern) || fullUrl.match(pattern);
      if (shareMatch) {
        shareParam = shareMatch[1];
        break;
      }
    }

    if (!shareParam) {
      return { success: false, error: 'Could not find share parameter in embed URL. This may not be a valid streaming embed.' };
    }

    // Decode the base64 share parameter with robust handling
    let decodedData: string;
    try {
      // Handle various URL encoding patterns
      let cleanBase64 = shareParam
        .replace(/%0D%0A/g, '') // Remove CRLF
        .replace(/%0A/g, '')   // Remove LF
        .replace(/%0D/g, '')   // Remove CR
        .replace(/%20/g, '')   // Remove spaces
        .replace(/%3D/g, '=')  // Decode = signs
        .replace(/\s/g, '');   // Remove any remaining whitespace

      // Ensure proper base64 padding
      while (cleanBase64.length % 4) {
        cleanBase64 += '=';
      }

      decodedData = atob(cleanBase64);
    } catch (error) {
      // Fallback: try decoding without URL decoding
      try {
        let cleanBase64 = shareParam.replace(/\s/g, '');
        while (cleanBase64.length % 4) {
          cleanBase64 += '=';
        }
        decodedData = atob(cleanBase64);
      } catch (fallbackError) {
        return { 
          success: false, 
          error: `Failed to decode base64 share parameter. The embed may be corrupted or use an unsupported format.` 
        };
      }
    }

    // Parse the JSON data with error handling
    let parsedData: Record<string, any>;
    try {
      parsedData = JSON.parse(decodedData);
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to parse JSON from decoded data. The embed data may be corrupted.` 
      };
    }

    // Validate that we have the minimum required data
    if (!parsedData || typeof parsedData !== 'object') {
      return { 
        success: false, 
        error: 'Decoded data is not a valid object. The embed may be corrupted.' 
      };
    }

    // Extract and validate relevant information
    const result: ParsedEmbedData = {
      quality: parsedData.quality || 'medium',
      avatarName: parsedData.avatarName || parsedData.avatar_name || 'Unknown Avatar',
      previewImg: parsedData.previewImg || parsedData.preview_img || parsedData.previewImage,
      needRemoveBackground: Boolean(parsedData.needRemoveBackground || parsedData.need_remove_background),
      knowledgeBaseId: parsedData.knowledgeBaseId || parsedData.knowledge_base_id || parsedData.knowledgeId,
      username: parsedData.username || parsedData.user_name,
      embedUrl: fullUrl,
      originalData: parsedData
    };

    // Validate that we extracted at least some meaningful data
    if (!result.avatarName || result.avatarName === 'Unknown Avatar') {
      console.warn('No avatar name found in embed data, using fallback');
    }

    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: `Unexpected error parsing embed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check that this is a valid HeyGen embed script.` 
    };
  }
}

/**
 * Generates a suggested avatar ID from the parsed data
 * @param parsedData - The parsed embed data
 * @returns A suggested avatar ID
 */
export function generateAvatarId(parsedData: ParsedEmbedData): string {
  if (parsedData.avatarName) {
    return parsedData.avatarName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }
  if (parsedData.username) {
    return `avatar_${parsedData.username}`;
  }
  return `avatar_${Date.now()}`;
}

/**
 * Suggests a category based on the avatar name
 * @param avatarName - The name of the avatar
 * @returns Suggested category
 */
export function suggestCategory(avatarName?: string): string {
  if (!avatarName) return 'General';
  
  const name = avatarName.toLowerCase();
  
  if (name.includes('fitness') || name.includes('coach') || name.includes('trainer')) {
    return 'Fitness';
  }
  if (name.includes('teacher') || name.includes('education') || name.includes('tutor')) {
    return 'Education';
  }
  if (name.includes('business') || name.includes('professional') || name.includes('executive')) {
    return 'Business';
  }
  if (name.includes('doctor') || name.includes('nurse') || name.includes('medical')) {
    return 'Healthcare';
  }
  if (name.includes('customer') || name.includes('support') || name.includes('service')) {
    return 'Customer Service';
  }
  if (name.includes('entertainment') || name.includes('host') || name.includes('presenter')) {
    return 'Entertainment';
  }
  
  return 'General';
}

/**
 * Cleans and formats the avatar name for display
 * @param avatarName - Raw avatar name from embed
 * @returns Cleaned display name
 */
export function formatAvatarName(avatarName?: string): string {
  if (!avatarName) return 'Unnamed Avatar';
  
  return avatarName
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Advanced parser that tries multiple extraction methods
 * @param embedScript - The embed script to parse
 * @returns Parsed data with additional metadata
 */
export function parseHeyGenEmbedAdvanced(embedScript: string): EmbedParseResult & {
  metadata?: {
    extractionMethod: string;
    scriptType: 'streaming' | 'static' | 'unknown';
    hasBackground: boolean;
    embedVersion?: string;
  }
} {
  const result = parseHeyGenEmbed(embedScript);
  
  if (result.success && result.data) {
    const metadata = {
      extractionMethod: 'standard',
      scriptType: embedScript.includes('streaming-embed') ? 'streaming' as const : 
                 embedScript.includes('embed') ? 'static' as const : 'unknown' as const,
      hasBackground: !result.data.needRemoveBackground,
      embedVersion: embedScript.includes('v3') ? 'v3' : 
                   embedScript.includes('v2') ? 'v2' : undefined
    };
    
    return { ...result, metadata };
  }
  
  return result;
}

/**
 * Batch parse multiple embed scripts
 * @param embedScripts - Array of embed scripts to parse
 * @returns Array of parse results
 */
export function parseMultipleEmbeds(embedScripts: string[]): EmbedParseResult[] {
  return embedScripts.map(script => {
    try {
      return parseHeyGenEmbed(script);
    } catch (error) {
      return {
        success: false,
        error: `Batch parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  });
}

/**
 * Validates if an embed script appears to be from a trusted source
 * @param embedScript - The embed script to validate
 * @returns True if from trusted source
 */
export function isValidEmbedSource(embedScript: string): boolean {
  const trustedHeyGenDomains = [
    'labs.heygen.com',
    'app.heygen.com',
    'heygen.com',
    'api.heygen.com'
  ];

  const trustedLiveAvatarDomains = [
    'embed.liveavatar.com',
    'liveavatar.com',
    'api.liveavatar.com'
  ];
  
  const normalizedScript = embedScript.toLowerCase();
  
  // Check for HeyGen
  const hasHeyGenDomain = trustedHeyGenDomains.some(domain => 
    normalizedScript.includes(domain.toLowerCase())
  );
  
  const hasHeyGenStructure = /function\s*\(\s*window\s*\)/.test(embedScript) &&
                             /streaming-embed/.test(embedScript) &&
                             /share=/.test(embedScript);
  
  // Check for LiveAvatar
  const hasLiveAvatarDomain = trustedLiveAvatarDomains.some(domain =>
    normalizedScript.includes(domain.toLowerCase())
  );
  
  const hasLiveAvatarStructure = /<iframe/.test(embedScript) &&
                                  normalizedScript.includes('embed.liveavatar.com');
  
  // Return true if it matches either provider
  return (hasHeyGenDomain && hasHeyGenStructure) || (hasLiveAvatarDomain && hasLiveAvatarStructure);
}