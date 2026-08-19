// Local notifications utility — uses Capacitor Local Notifications plugin
// for water, workout, sleep, and meal reminders.

import { LocalNotifications, ScheduleOptions } from "@capacitor/local-notifications";

export interface ReminderConfig {
  id: number;
  title: string;
  body: string;
  hour: number;
  minute: number;
}

const REMINDERS: ReminderConfig[] = [
  {
    id: 1,
    title: "💧 Time to hydrate",
    body: "Drink a glass of water to stay hydrated.",
    hour: 10,
    minute: 0,
  },
  {
    id: 2,
    title: "💧 Water check",
    body: "Have you had enough water today?",
    hour: 14,
    minute: 0,
  },
  {
    id: 3,
    title: "💪 Workout time",
    body: "Time for your scheduled workout. Let's go!",
    hour: 17,
    minute: 0,
  },
  {
    id: 4,
    title: "😴 Wind down",
    body: "Start winding down for bed. Avoid screens.",
    hour: 21,
    minute: 30,
  },
  {
    id: 5,
    title: "🍽️ Log your meals",
    body: "Don't forget to log what you ate today.",
    hour: 20,
    minute: 0,
  },
];

// Request permission for notifications
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const permission = await LocalNotifications.requestPermissions();
    return permission.display === "granted";
  } catch {
    return false;
  }
}

// Schedule all daily reminders
export async function scheduleReminders(enabled: {
  water: boolean;
  workout: boolean;
  sleep: boolean;
  meal: boolean;
}): Promise<void> {
  try {
    // Cancel existing
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }

    const toSchedule: ScheduleOptions["notifications"] = [];

    for (const reminder of REMINDERS) {
      let shouldSchedule = false;
      if (reminder.id <= 2 && enabled.water) shouldSchedule = true;
      if (reminder.id === 3 && enabled.workout) shouldSchedule = true;
      if (reminder.id === 4 && enabled.sleep) shouldSchedule = true;
      if (reminder.id === 5 && enabled.meal) shouldSchedule = true;

      if (shouldSchedule) {
        // Schedule for tomorrow and repeat daily
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(reminder.hour, reminder.minute, 0, 0);

        toSchedule.push({
          id: reminder.id,
          title: reminder.title,
          body: reminder.body,
          schedule: {
            at: tomorrow,
            repeats: true,
            every: "day" as const,
          },
          smallIcon: "ic_launcher_foreground",
          largeIcon: "ic_launcher",
        });
      }
    }

    if (toSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: toSchedule });
    }
  } catch {
    // Silent fallback — notifications not supported
  }
}

// Cancel all reminders
export async function cancelAllReminders(): Promise<void> {
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }
  } catch {
    // Silent fallback
  }
}
