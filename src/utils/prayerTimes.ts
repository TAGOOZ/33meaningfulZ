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

function formatRemainingTime(diff: number): string {
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const toArabicNumber = (num: number) => 
    num.toString().split('').map(d => arabicNumbers[parseInt(d)]).join('');

  let remainingTime = '';
  
  if (hours > 0) {
    remainingTime += `${toArabicNumber(hours)} ساعة `;
  }
  
  if (minutes > 0 || hours === 0) {
    remainingTime += `${toArabicNumber(minutes)} دقيقة`;
  }

  return remainingTime || 'أقل من دقيقة';
}

export function getNextPrayer(coordinates: Coordinates): NextPrayer {
  const now = new Date();
  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayTimes = new PrayerTimes(
    new AdhanCoordinates(coordinates.latitude, coordinates.longitude),
    today,
    CalculationMethod.MuslimWorldLeague()
  );

  const tomorrowTimes = new PrayerTimes(
    new AdhanCoordinates(coordinates.latitude, coordinates.longitude),
    tomorrow,
    CalculationMethod.MuslimWorldLeague()
  );

  // Get all prayer times for today and tomorrow
  const prayers = [
    { name: 'fajr', time: todayTimes.fajr },
    { name: 'dhuhr', time: todayTimes.dhuhr },
    { name: 'asr', time: todayTimes.asr },
    { name: 'maghrib', time: todayTimes.maghrib },
    { name: 'isha', time: todayTimes.isha },
    // Add tomorrow's fajr
    { name: 'fajr', time: tomorrowTimes.fajr }
  ];

  // Find the next prayer
  const nextPrayer = prayers.find(prayer => prayer.time > now) || prayers[0];

  // Calculate time difference
  const diff = nextPrayer.time.getTime() - now.getTime();
  const remainingTime = formatRemainingTime(diff);

  return {
    name: nextPrayer.name,
    time: nextPrayer.time,
    remainingTime
  };
}