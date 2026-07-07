export function interpolateNotificationText(template: string, args: Record<string, string>): string {
  return Object.entries(args).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}
