import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getNextPrayer, type Coordinates, type NextPrayer } from '../utils/prayerTimes';
import { getPrayerNameInArabic } from '../utils/notifications';

export default function NextPrayerTime() {
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);

  useEffect(() => {
    async function updateNextPrayer() {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const coordinates: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        const next = getNextPrayer(coordinates);
        setNextPrayer(next);
      } catch (error) {
        console.error('Error getting next prayer time:', error);
        // Use Mecca coordinates as fallback
        const coordinates: Coordinates = {
          latitude: 21.4225,
          longitude: 39.8262,
        };
        const next = getNextPrayer(coordinates);
        setNextPrayer(next);
      }
    }

    updateNextPrayer();
    // Update every minute
    const interval = setInterval(updateNextPrayer, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!nextPrayer) {
    return null;
  }

  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/50 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
          <Clock className="w-5 h-5" />
          <span className="font-bold">الصلاة القادمة</span>
        </div>
        <div className="text-emerald-600 dark:text-emerald-300 font-bold">
          {getPrayerNameInArabic(nextPrayer.name)}
        </div>
      </div>
      <div className="mt-2 flex justify-between items-center text-sm">
        <div className="text-gray-600 dark:text-gray-400">
          {nextPrayer.time.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-emerald-600 dark:text-emerald-400 font-arabic">
          {nextPrayer.remainingTime}
        </div>
      </div>
    </div>
  );
}