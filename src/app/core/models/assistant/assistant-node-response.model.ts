import { AssistantOptionResponse } from './assistant-option-response.model';
import { AssistantNavigationResponse } from './assistant-navigation-response.model';

export interface AssistantNodeResponse {
  nodeId: string;
  messageKey: string;
  messageArgs: string[];
  options: AssistantOptionResponse[];
  isFinal: boolean;
  navigateTo: AssistantNavigationResponse[] | null;
}
