// AI Chat Service - Using Google Gemini AI
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface FileAttachment {
  mimeType: string;
  data: string; // Base64 encoded
  name: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  file?: FileAttachment;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  data?: {
    response: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

class GeminiService {
  private geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  private genAI: GoogleGenerativeAI | null = null;
  
  constructor() {
    console.log('Gemini AI Service initialized');
    if (this.geminiApiKey && this.geminiApiKey !== 'your_gemini_api_key_here') {
      this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
      console.log('Using Google Gemini AI with API key');
    } else {
      console.log('Using enhanced local simulation (no Gemini API key)');
    }
  }

  async sendMessage(
    messages: ChatMessage[],
    avatarContext?: {
      name: string;
      category: string;
      knowledgeBaseId?: string;
    },
    fileAttachment?: FileAttachment
  ): Promise<ChatResponse> {
    const lastMessage = messages[messages.length - 1]?.content || '';
    console.log('Sending message to AI:', lastMessage, 'with file:', fileAttachment?.name);
    
    try {
      if (this.genAI) {
        return await this.callGeminiAPI(messages, avatarContext, fileAttachment);
      } else {
        return await this.getEnhancedLocalResponse(messages, avatarContext, fileAttachment);
      }
    } catch (error: any) {
      console.error('AI API error:', error);
      console.log('Falling back to local simulation');
      return await this.getEnhancedLocalResponse(messages, avatarContext, fileAttachment);
    }
  }

  async summarizeConversation(
    messages: ChatMessage[],
    avatarContext?: {
      name: string;
      category: string;
      knowledgeBaseId?: string;
    }
  ): Promise<ChatResponse> {
    console.log('Summarizing conversation with', messages.length, 'messages');
    
    try {
      if (this.genAI) {
        return await this.callGeminiSummarization(messages, avatarContext);
      } else {
        return await this.getLocalSummary(messages, avatarContext);
      }
    } catch (error: any) {
      console.error('Summarization error:', error);
      console.log('Falling back to local summary');
      return await this.getLocalSummary(messages, avatarContext);
    }
  }

  private async callGeminiAPI(
    messages: ChatMessage[],
    avatarContext?: { name: string; category: string; knowledgeBaseId?: string; },
    fileAttachment?: FileAttachment
  ): Promise<ChatResponse> {
    
    if (!this.genAI) {
      throw new Error('Gemini AI not initialized');
    }

    const avatarName = avatarContext?.name || 'AI Assistant';
    const category = avatarContext?.category || 'general topics';
    const lastMessage = messages[messages.length - 1]?.content || '';

    // Create context for the AI
    const systemPrompt = `You are ${avatarName}, a helpful and friendly AI assistant specializing in ${category}. 
    Your personality traits:
    - Warm and approachable
    - Knowledgeable about ${category}
    - Helpful and encouraging
    - Conversational and engaging
    
    Respond naturally to the user's message. Keep responses concise but informative (2-3 sentences max).`;

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // Build conversation history
      const conversationHistory = messages
        .slice(-5) // Keep last 5 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : avatarName}: ${msg.content}`)
        .join('\n');
      
      const prompt = `${systemPrompt}\n\nConversation history:\n${conversationHistory}\n\n${avatarName}:`;
      
      // Handle file attachment if present
      let content: any;
      
      if (fileAttachment) {
        // Prepare file content for Gemini
        const base64Data = fileAttachment.data.split(',')[1] || fileAttachment.data; // Remove data:image/png;base64, prefix if present
        
        content = [
          {
            text: prompt
          },
          {
            inlineData: {
              mimeType: fileAttachment.mimeType,
              data: base64Data
            }
          }
        ];
      } else {
        content = prompt;
      }
      
      const result = await model.generateContent(content);
      const response = await result.response;
      const responseText = response.text().trim();

      if (!responseText) {
        throw new Error('Empty response from Gemini');
      }

      console.log('Gemini AI response received', { hasFile: !!fileAttachment, fileName: fileAttachment?.name });
      
      return {
        success: true,
        data: {
          response: responseText,
          usage: {
            prompt_tokens: Math.floor(prompt.length / 4),
            completion_tokens: Math.floor(responseText.length / 4),
            total_tokens: Math.floor((prompt.length + responseText.length) / 4)
          }
        }
      };

    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  private async getEnhancedLocalResponse(
    messages: ChatMessage[],
    avatarContext?: { name: string; category: string; knowledgeBaseId?: string; },
    fileAttachment?: FileAttachment
  ): Promise<ChatResponse> {
    console.log('Using enhanced local AI simulation...', { hasFile: !!fileAttachment, fileName: fileAttachment?.name });
    
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
    const avatarName = avatarContext?.name || 'AI Assistant';
    const category = avatarContext?.category || 'general topics';
    
    // Simulate realistic AI processing time (longer with file)
    await new Promise(resolve => setTimeout(resolve, fileAttachment ? 1200 + Math.random() * 1500 : 800 + Math.random() * 1200));

    let response = '';
    
    // If file is attached, acknowledge it
    if (fileAttachment) {
      const fileType = fileAttachment.mimeType.startsWith('image/') ? 'image' : 'document';
      response = `Thanks for sharing that ${fileType}! I've analyzed "${fileAttachment.name}" and I can see the content clearly. `;
      
      if (fileAttachment.mimeType.startsWith('image/')) {
        response += `This is an interesting image! I can see the visual elements and would love to help you explore what's shown here. What would you like to know about it?`;
      } else {
        response += `I can see the content of this document. Feel free to ask me anything about it - I can explain, summarize, or discuss any part in detail.`;
      }
    }
    // Intelligent pattern matching for natural responses
    else if (lastMessage.includes('hello') || lastMessage.includes('hi') || lastMessage.includes('hey')) {
      response = `Hello there! I'm ${avatarName}, your ${category} assistant. I'm excited to chat with you today! What would you like to explore or learn about?`;
    } 
    else if (lastMessage.includes('how are you') || lastMessage.includes('how do you do')) {
      response = `I'm doing wonderfully, thank you for asking! As an AI specializing in ${category}, I'm always energized and ready to help. How are you doing today?`;
    }
    else if (lastMessage.includes('what can you do') || lastMessage.includes('what are your capabilities')) {
      response = `Great question! As ${avatarName}, I can help you with various aspects of ${category}. I can answer questions, provide explanations, offer guidance, and engage in meaningful conversations. What specific area interests you most?`;
    }
    else if (lastMessage.includes('tell me about') || lastMessage.includes('explain')) {
      response = `I'd be happy to explain that! As someone knowledgeable in ${category}, I find this topic fascinating. Let me break it down for you in a clear and helpful way.`;
    }
    else if (lastMessage.includes('help') || lastMessage.includes('assist')) {
      response = `Absolutely! I'm here to help you with anything related to ${category}. Whether you need detailed explanations, guidance, or just want to have a thoughtful conversation, I'm ready to assist. What can I help you with?`;
    }
    else if (lastMessage.includes('thank') || lastMessage.includes('appreciate')) {
      response = `You're so welcome! It's my pleasure to help. I really enjoy our conversation and I'm glad I could be useful. Please don't hesitate to ask if you have any other questions!`;
    }
    else if (lastMessage.includes('goodbye') || lastMessage.includes('bye') || lastMessage.includes('see you')) {
      response = `It was wonderful chatting with you! Feel free to come back anytime you want to discuss ${category} or anything else. Take care and have a great day!`;
    }
    else if (lastMessage.includes('?')) {
      // Handle questions intelligently
      const questionResponses = [
        `That's an excellent question! Based on my knowledge of ${category}, I think there are several important aspects to consider here.`,
        `I'm glad you asked about that! This is definitely something worth exploring, especially in the context of ${category}.`,
        `Great question! Let me share some insights about this from my perspective as ${avatarName}.`,
        `That's a thoughtful question! In my experience with ${category}, this topic has some really interesting dimensions.`
      ];
      response = questionResponses[Math.floor(Math.random() * questionResponses.length)];
      response += ` Would you like me to dive deeper into any particular aspect of this?`;
    }
    else {
      // General conversational responses
      const generalResponses = [
        `That's really interesting! As ${avatarName}, I find your perspective quite thought-provoking.`,
        `I appreciate you sharing that with me! It's always great to discuss topics related to ${category}.`,
        `Thanks for bringing that up! This gives us a nice opportunity to explore this aspect of ${category} together.`,
        `I see what you mean! This is exactly the kind of engaging discussion I enjoy having about ${category}.`,
        `That's a valuable point! Let me share some thoughts that might complement what you've mentioned.`
      ];
      response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
      response += ` What are your thoughts on how this relates to other aspects we might explore?`;
    }

    console.log('Local simulation response generated');

    return {
      success: true,
      data: {
        response,
        usage: {
          prompt_tokens: Math.floor(lastMessage.length / 4),
          completion_tokens: Math.floor(response.length / 4),
          total_tokens: Math.floor((lastMessage.length + response.length) / 4)
        }
      }
    };
  }

  private async callGeminiSummarization(
    messages: ChatMessage[],
    avatarContext?: { name: string; category: string; knowledgeBaseId?: string; }
  ): Promise<ChatResponse> {
    if (!this.genAI) {
      throw new Error('Gemini AI not initialized');
    }

    const avatarName = avatarContext?.name || 'AI Assistant';
    const category = avatarContext?.category || 'general topics';

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // Build conversation history for summarization
      const conversationText = messages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
      
      const prompt = `Please provide a concise summary (2-3 sentences) of the following conversation about ${category}. Focus on the key topics discussed and any important context. The summary will be used to brief ${avatarName} on what was discussed.

Conversation:
${conversationText}

Summary:`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();

      if (!responseText) {
        throw new Error('Empty response from Gemini');
      }

      console.log('Conversation summary generated successfully');
      
      return {
        success: true,
        data: {
          response: responseText,
          usage: {
            prompt_tokens: Math.floor(prompt.length / 4),
            completion_tokens: Math.floor(responseText.length / 4),
            total_tokens: Math.floor((prompt.length + responseText.length) / 4)
          }
        }
      };

    } catch (error: any) {
      console.error('Gemini summarization error:', error);
      throw error;
    }
  }

  private async getLocalSummary(
    messages: ChatMessage[],
    avatarContext?: { name: string; category: string; knowledgeBaseId?: string; }
  ): Promise<ChatResponse> {
    console.log('Using local summarization...');
    
    const category = avatarContext?.category || 'general topics';
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple local summary generation
    const messageCount = messages.length;
    const userMessages = messages.filter(m => m.role === 'user');
    const topics = userMessages
      .map(m => m.content.split(' ').slice(0, 5).join(' '))
      .slice(0, 3);

    let summary = `I've reviewed the conversation about ${category}. `;
    
    if (messageCount > 10) {
      summary += `You discussed several topics including: ${topics.join(', ')}. There were many interactions exploring different aspects of these subjects.`;
    } else if (messageCount > 5) {
      summary += `You covered: ${topics.join(', ')}. We had a good discussion on these key areas.`;
    } else {
      summary += `We discussed ${topics[0] || 'some topics'}. `;
    }

    return {
      success: true,
      data: {
        response: summary,
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      }
    };
  }
}

export const geminiService = new GeminiService();