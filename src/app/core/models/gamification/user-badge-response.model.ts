export interface UserBadgeResponse {
  code: string;
  tier: string;
  messageKey: string;
  descriptionMessageKey: string;
  isUnlocked: boolean;
  unlockedAt?: string | null;
}
