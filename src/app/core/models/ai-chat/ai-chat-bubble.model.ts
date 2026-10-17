import { AiChatAction } from './ai-chat-action.model';
import { InvoicePaymentProposal } from './invoice-payment-proposal.model';

export type InvoicePaymentStatus = 'idle' | 'paying' | 'paid';

export interface AiChatBubblePayment {
  proposal: InvoicePaymentProposal;
  status: InvoicePaymentStatus;
}

export interface AiChatBubble {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestions: string[];
  actions: AiChatAction[];
  payment: AiChatBubblePayment | null;
  isError: boolean;
  inHistory: boolean;
}
