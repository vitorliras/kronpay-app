import { AssistantOptionResponse } from '../../../core/models/assistant/assistant-option-response.model';
import { AssistantNavigationResponse } from '../../../core/models/assistant/assistant-navigation-response.model';

export interface AssistantChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  options: AssistantOptionResponse[];
  isFinal: boolean;
  navigateTo: AssistantNavigationResponse[] | null;
}
