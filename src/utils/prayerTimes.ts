import { PrayerTimes, Coordinates as AdhanCoordinates, CalculationParameters, CalculationMethod } from 'adhan';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface NextPrayer {
  name: string;
  time: Date;
  remainingTime: string;
}

export function getPrayerTimes(coordinates: Coordinates): Record<string, Date> {
  const date = new Date();
  const adhanCoordinates = new AdhanCoordinates(coordinates.latitude, coordinates.longitude);
  const params = CalculationMethod.MuslimWorldLeague();
  
  const prayerTimes = new PrayerTimes(adhanCoordinates, date, params);

  return {
    fajr: prayerTimes.fajr,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha
  };
}

export function getNextPrayer(coordinates: Coordinates): NextPrayer {
  const times = getPrayerTimes(coordinates);
  const now = new Date();
  let nextPrayer: string = 'fajr';
  let nextPrayerTime: Date = times.fajr;

  // Find the next prayer
  for (const [prayer, time] of Object.entries(times)) {
    if (time > now) {
      nextPrayer = prayer;
      nextPrayerTime = time;
      break;
    }
  }

  // If all prayers for today have passed, get tomorrow's Fajr
  if (nextPrayerTime < now) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = getPrayerTimes(coordinates);
    nextPrayer = 'fajr';
    nextPrayerTime = tomorrowTimes.fajr;
  }

  // Calculate remaining time
  const diff = nextPrayerTime.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  // Format remaining time in Arabic
  let remainingTime = '';
  if (hours > 0) {
    remainingTime += `${hours} ساعة `;
  }
  if (minutes > 0 || hours === 0) {
    remainingTime += `${minutes} دقيقة`;
  }

  return {
    name: nextPrayer,
    time: nextPrayerTime,
    remainingTime
  };
}