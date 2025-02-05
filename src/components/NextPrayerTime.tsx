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
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-emerald-50 dark:bg-emerald-900/50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 mb-2">
          <Clock className="w-5 h-5" />
          <span className="font-bold">الصلاة القادمة</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-emerald-600 dark:text-emerald-300 font-bold text-lg">
            {getPrayerNameInArabic(nextPrayer.name)}
          </div>
          <div className="text-emerald-600 dark:text-emerald-300 font-bold">
            {nextPrayer.time.toLocaleTimeString('ar-SA', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-900/50 rounded-lg p-4">
        <div className="text-emerald-800 dark:text-emerald-200 font-bold mb-2">
          الوقت المتبقي
        </div>
        <div className="text-emerald-600 dark:text-emerald-300 font-bold text-lg">
          {nextPrayer.remainingTime}
        </div>
      </div>
    </div>
  );
}