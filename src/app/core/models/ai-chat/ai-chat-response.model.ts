import { AiChatAction } from './ai-chat-action.model';

export interface AiChatResponse {
  reply: string;
  suggestions: string[];
  actions: AiChatAction[];
}
