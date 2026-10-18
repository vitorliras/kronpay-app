import { ChatAttachmentSummary } from './chat-attachment-summary.model';

export interface UploadChatAttachmentsResponse {
  attachments: ChatAttachmentSummary[];
  unreadableFiles: string[];
}
