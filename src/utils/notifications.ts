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
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Send welcome notification
        showNotification('تدبر الذكر', {
          body: 'تم تفعيل التنبيهات بنجاح! سنذكرك بأوقات الذكر والصلاة 🤲',
          icon: '/dhikr-logo.png',
          badge: '/dhikr-logo.png',
          tag: 'welcome',
          renotify: true,
          requireInteraction: true
        });
      }
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
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

function showNotification(title: string, options: NotificationOptions) {
  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          ...options,
          silent: false,
          requireInteraction: true,
          vibrate: [200, 100, 200]
        });
      });
    } else {
      const notification = new Notification(title, {
        ...options,
        silent: false,
        requireInteraction: true
      });
      notification.onclick = function() {
        window.focus();
        notification.close();
      };
    }
    return true;
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
}

function scheduleNotificationForTime(time: Date, title: string, body: string, tag: string) {
  const now = new Date();
  let scheduledTime = new Date(time);

  // If the time has passed for today, schedule for tomorrow
  if (scheduledTime < now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const timeUntilNotification = scheduledTime.getTime() - now.getTime();

  // Only schedule if it's in the future
  if (timeUntilNotification > 0) {
    const timer = setTimeout(() => {
      showNotification(title, {
        body,
        icon: '/dhikr-logo.png',
        badge: '/dhikr-logo.png',
        tag,
        renotify: true,
        requireInteraction: true
      });
      
      // Reschedule for next day immediately after showing notification
      scheduleNotificationForTime(scheduledTime, title, body, tag);
    }, timeUntilNotification);

    notificationTimers.push(timer);
  }
}

export async function scheduleNotifications(
  enablePrayerNotifications: boolean = true,
  reminderTimes: number[] = [9, 14, 17]
) {
  if (Notification.permission !== 'granted') {
    return;
  }

  clearAllNotifications();

  try {
    const coordinates = await getCurrentPosition();

    if (enablePrayerNotifications) {
      const prayerTimes = getPrayerTimes(coordinates);

      // Schedule notifications for each prayer time
      Object.entries(prayerTimes).forEach(([prayer, time]) => {
        const notificationTime = new Date(time);
        notificationTime.setMinutes(notificationTime.getMinutes() - 10); // 10 minutes before prayer

        scheduleNotificationForTime(
          notificationTime,
          'تدبر الذكر',
          `حان وقت أذكار صلاة ${getPrayerNameInArabic(prayer)} 🤲`,
          `prayer-${prayer}`
        );
      });
    }

    // Schedule dhikr reminders
    reminderTimes.forEach((time, index) => {
      const hour = Math.floor(time);
      const minute = Math.round((time - hour) * 60);
      
      const reminderTime = new Date();
      reminderTime.setHours(hour, minute, 0, 0);

      scheduleNotificationForTime(
        reminderTime,
        'تدبر الذكر',
        'حان وقت الذكر والدعاء 🤲',
        `reminder-${index}`
      );
    });

    // Show confirmation notification
    const timesStr = reminderTimes
      .map(time => {
        const hour = Math.floor(time);
        const minute = Math.round((time - hour) * 60);
        return `${hour}:${minute.toString().padStart(2, '0')}`;
      })
      .join('، ');

    showNotification('تدبر الذكر', {
      body: `تم جدولة تذكير الأذكار في الأوقات التالية:\n${timesStr} ⏰`,
      icon: '/dhikr-logo.png',
      badge: '/dhikr-logo.png',
      tag: 'schedule-update',
      renotify: true,
      requireInteraction: true
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