// Haptic feedback utility — uses Capacitor Haptics plugin for native feel.
// Falls back gracefully on web (no vibration API used to avoid permission prompts).

import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

export async function hapticLight(): Promise<void> {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Web or unsupported — silent fallback
  }
}

export async function hapticMedium(): Promise<void> {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    // Silent fallback
  }
}

export async function hapticHeavy(): Promise<void> {
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch {
    // Silent fallback
  }
}

export async function hapticSuccess(): Promise<void> {
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    // Silent fallback
  }
}

export async function hapticWarning(): Promise<void> {
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch {
    // Silent fallback
  }
}

export async function hapticError(): Promise<void> {
  try {
    await Haptics.notification({ type: NotificationType.Error });
  } catch {
    // Silent fallback
  }
}

// Vibrate pattern for rest timer completion
export async function hapticTimerDone(): Promise<void> {
  try {
    await Haptics.vibrate({ duration: 500 });
  } catch {
    // Silent fallback
  }
}
