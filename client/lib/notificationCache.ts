import type { NotificationItem, Page } from "./types";

let cachedNotifications: NotificationItem[] | null = null;
let cachedAt = 0;

const CACHE_TTL = 5000;

export function getCachedNotifications() {
  if (
    cachedNotifications &&
    Date.now() - cachedAt < CACHE_TTL
  ) {
    return cachedNotifications;
  }

  return null;
}

export function setCachedNotifications(
  notifications: NotificationItem[]
) {
  cachedNotifications = notifications;
  cachedAt = Date.now();
}

export function clearNotificationCache() {
  cachedNotifications = null;
  cachedAt = 0;
}