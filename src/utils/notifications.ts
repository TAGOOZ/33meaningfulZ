import { getPrayerTimes, Coordinates, getNextPrayer } from './prayerTimes';

export async function setupNotifications(): Promise<boolean> {
  if (!('Notification' in window)) {
    alert('عذراً، متصفحك لا يدعم التنبيهات');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Test notification to confirm it works
        const isDesktop = !('standalone' in navigator) && !('serviceWorker' in navigator);
        if (isDesktop) {
          showNotification('تدبر الذكر', {
            body: 'تم تفعيل التنبيهات على المتصفح! سنذكرك بأوقات الذكر والصلاة 🤲',
            icon: '/dhikr-logo.png',
            badge: '/dhikr-logo.png',
            tag: 'welcome',
            renotify: true,
            requireInteraction: true,
            silent: false,
            data: { url: window.location.href }
          });
        } else {
          // Mobile notification
          showNotification('تدبر الذكر', {
            body: 'تم تفعيل التنبيهات! سنذكرك بأوقات الذكر والصلاة 🤲',
            icon: '/dhikr-logo.png',
            badge: '/dhikr-logo.png',
            tag: 'welcome',
            renotify: true,
            requireInteraction: true,
            data: { url: window.location.href }
          });
        }
      }
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      alert('حدث خطأ أثناء طلب إذن التنبيهات');
      return false;
    }
  }

  return false;
}

async function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      resolve({
        latitude: 21.4225,
        longitude: 39.8262,
      });
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
      },
      { timeout: 5000, maximumAge: 600000 } // 5s timeout, 10min cache
    );
  });
}

let notificationTimers: NodeJS.Timeout[] = [];

export function clearAllNotifications() {
  notificationTimers.forEach(timer => clearTimeout(timer));
  notificationTimers = [];
  
  // Clear any existing notifications
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then(registration => {
      registration.getNotifications().then(notifications => {
        notifications.forEach(notification => notification.close());
      });
    });
  }
}

function showNotification(title: string, options: NotificationOptions): boolean {
  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const isDesktop = !('standalone' in navigator) && !('serviceWorker' in navigator);
    const currentUrl = window.location.href;
    
    if (isDesktop) {
      // Desktop browser notification
      const notification = new Notification(title, {
        ...options,
        silent: false,
        requireInteraction: true,
        icon: '/dhikr-logo.png',
        data: { url: currentUrl }
      });
      
      notification.onclick = function() {
        // Focus or open the window
        if (window.parent) {
          window.parent.focus();
        }
        window.focus();
        
        // Open the app URL if window is not focused
        if (document.visibilityState === 'hidden') {
          window.open(currentUrl, '_blank');
        }
        
        notification.close();
      };
    } else {
      // Mobile PWA notification via Service Worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            ...options,
            silent: false,
            requireInteraction: true,
            vibrate: [200, 100, 200],
            icon: '/dhikr-logo.png',
            badge: '/dhikr-logo.png',
            data: { url: currentUrl },
            actions: [
              {
                action: 'open',
                title: 'فتح التطبيق'
              }
            ]
          });
        });
      }
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
      const isDesktop = !('standalone' in navigator) && !('serviceWorker' in navigator);
      const currentUrl = window.location.href;
      
      showNotification(title, {
        body,
        icon: '/dhikr-logo.png',
        badge: '/dhikr-logo.png',
        tag,
        renotify: true,
        requireInteraction: true,
        silent: false,
        data: { url: currentUrl },
        ...(isDesktop ? {} : {
          vibrate: [200, 100, 200],
          actions: [
            {
              action: 'open',
              title: 'فتح التطبيق'
            }
          ]
        })
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
    const currentUrl = window.location.href;

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

    const isDesktop = !('standalone' in navigator) && !('serviceWorker' in navigator);
    showNotification('تدبر الذكر', {
      body: `تم جدولة تذكير الأذكار في الأوقات التالية:\n${timesStr} ⏰`,
      icon: '/dhikr-logo.png',
      badge: '/dhikr-logo.png',
      tag: 'schedule-update',
      renotify: true,
      requireInteraction: true,
      silent: false,
      data: { url: currentUrl },
      ...(isDesktop ? {} : {
        vibrate: [200, 100, 200],
        actions: [
          {
            action: 'open',
            title: 'فتح التطبيق'
          }
        ]
      })
    });
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    alert('حدث خطأ أثناء جدولة التنبيهات');
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
