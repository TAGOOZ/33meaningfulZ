import { getPrayerTimes, Coordinates, getNextPrayer } from './prayerTimes';

export async function setupNotifications(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

async function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn('Error getting location:', error);
        // Default to Mecca coordinates if location access is denied
        resolve({
          latitude: 21.4225,
          longitude: 39.8262,
        });
      }
    );
  });
}

let notificationTimers: NodeJS.Timeout[] = [];

export function clearAllNotifications() {
  notificationTimers.forEach(timer => clearTimeout(timer));
  notificationTimers = [];
}

export async function scheduleNotifications(
  enablePrayerNotifications: boolean = true,
  reminderTimes: number[] = [9, 14, 17]
) {
  clearAllNotifications();

  try {
    if (enablePrayerNotifications) {
      const coordinates = await getCurrentPosition();
      const prayerTimes = getPrayerTimes(coordinates);

      // Schedule notifications for each prayer time
      Object.entries(prayerTimes).forEach(([prayer, time]) => {
        const scheduledTime = new Date(time);
        // Add 10 minutes to prayer time for notification
        scheduledTime.setMinutes(scheduledTime.getMinutes() + 10);
        const now = new Date();

        // If the time has passed today, schedule for tomorrow
        if (now > scheduledTime) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const timeUntilNotification = scheduledTime.getTime() - now.getTime();

        const timer = setTimeout(() => {
          new Notification('تدبر الذكر', {
            body: `حان وقت أذكار صلاة ${getPrayerNameInArabic(prayer)} 🤲`,
            icon: '/pwa-192x192.png',
            badge: '/pwa-64x64.png',
            tag: prayer,
            renotify: true
          });
          // Reschedule for the next day
          scheduleNotifications(enablePrayerNotifications, reminderTimes);
        }, timeUntilNotification);

        notificationTimers.push(timer);
      });
    }

    // Schedule reminders at specific times
    reminderTimes.forEach((hour, index) => {
      const now = new Date();
      const scheduledTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hour,
        0
      );

      if (now > scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const timeUntilNotification = scheduledTime.getTime() - now.getTime();

      const timer = setTimeout(() => {
        new Notification('تدبر الذكر', {
          body: 'حان وقت الذكر والدعاء 🤲',
          icon: '/pwa-192x192.png',
          badge: '/pwa-64x64.png',
          tag: `reminder-${index}`,
          renotify: true
        });
      }, timeUntilNotification);

      notificationTimers.push(timer);
    });
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
}

export function getPrayerNameInArabic(prayer: string): string {
  const names: Record<string, string> = {
    fajr: 'الفجر',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء'
  };
  return names[prayer] || prayer;
}