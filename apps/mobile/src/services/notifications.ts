export type NotificationPermissionStatus = "unknown" | "granted" | "denied";

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  return "unknown";
}
