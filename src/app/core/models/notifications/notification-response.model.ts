export interface NotificationResponse {
  id: number;
  type: string;
  criticality: string;
  messageKey: string;
  args: Record<string, string>;
  relatedEntityType: string | null;
  relatedEntityId: number | null;
  isRead: boolean;
  createdAt: string;
}
