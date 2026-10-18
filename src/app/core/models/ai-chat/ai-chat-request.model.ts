import { AiChatMessage } from './ai-chat-message.model';

export interface AiChatRequest {
  messages: AiChatMessage[];
  attachmentIds?: string[];
}
