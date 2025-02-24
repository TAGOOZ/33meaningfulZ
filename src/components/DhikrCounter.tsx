import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, Infinity, Hash, Download, Info, Bell } from 'lucide-react';
import { dhikrPhrases } from '../data/phrases';
import type { DhikrState } from '../types';
import AboutPage from './AboutPage';
import NextPrayerTime from './NextPrayerTime';
import NotificationSettings from './NotificationSettings';
import { setupNotifications, scheduleNotifications, clearAllNotifications } from '../utils/notifications';
import { saveDhikrState, loadDhikrState, saveSettings, loadSettings, updateDailyStats } from '../utils/storage';

export default function DhikrCounter() {
  const [state, setState] = useState<DhikrState>(() => {
    const savedState = loadDhikrState();
    return savedState || {
      count: 0,
      currentType: 'tasbih',
      displayMode: 'dynamic',
      totalCount: 0,
      isEndlessMode: false,
    };
  });

  const [isDark, setIsDark] = useState(() => {
    const settings = loadSettings();
    return settings?.isDark ?? document.documentElement.classList.contains('dark');
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const settings = loadSettings();
    return settings?.notificationsEnabled ?? false;
  });
  const [prayerNotifications, setPrayerNotifications] = useState(() => {
    const settings = loadSettings();
    return settings?.prayerNotifications ?? true;
  });
  const [reminderTimes, setReminderTimes] = useState(() => {
    const settings = loadSettings();
    return settings?.reminderTimes ?? [9, 14, 17];
  });

  useEffect(() => {
    saveDhikrState(state);
  }, [state]);

  useEffect(() => {
    saveSettings({
      isDark,
      notificationsEnabled,
      prayerNotifications,
      reminderTimes,
    });
  }, [isDark, notificationsEnabled, prayerNotifications, reminderTimes]);

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      const enabled = await setupNotifications();
      setNotificationsEnabled(enabled);
      if (enabled) {
        scheduleNotifications(prayerNotifications, reminderTimes);
      }
    } else {
      setNotificationsEnabled(false);
      clearAllNotifications();
    }
  };

  const handlePrayerNotificationsToggle = () => {
    setPrayerNotifications(!prayerNotifications);
    if (notificationsEnabled) {
      scheduleNotifications(!prayerNotifications, reminderTimes);
    }
  };

  const handleReminderTimesUpdate = (newTimes: number[]) => {
    setReminderTimes(newTimes);
    if (notificationsEnabled) {
      scheduleNotifications(prayerNotifications, newTimes);
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    setDeferredPrompt(null);
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const getCurrentPhrase = () => {
    if (!state.isEndlessMode && state.totalCount === 99) {
      return {
        id: 100,
        text: 'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير',
        type: state.currentType
      };
    }
    const phrases = dhikrPhrases[state.currentType];
    return phrases[state.count % phrases.length];
  };

  const handleCount = () => {
    setState(prev => {
      const newCount = prev.count + 1;
      const newTotalCount = prev.totalCount + 1;

      updateDailyStats(1);

      if (!prev.isEndlessMode) {
        if (newTotalCount === 100) {
          return {
            count: 0,
            currentType: 'tasbih',
            displayMode: prev.displayMode,
            totalCount: 0,
            isEndlessMode: false,
          };
        }

        if (newCount === 33) {
          const types = ['tasbih', 'tahmid', 'takbir'] as const;
          const currentIndex = types.indexOf(prev.currentType);
          const nextType = types[(currentIndex + 1) % types.length];
          return {
            ...prev,
            count: 0,
            currentType: nextType,
            totalCount: newTotalCount,
          };
        }
      }

      return {
        ...prev,
        count: prev.isEndlessMode ? newCount : newCount,
        totalCount: newTotalCount,
      };
    });
  };

  const handleTypeChange = (type: 'tasbih' | 'tahmid' | 'takbir') => {
    setState(prev => ({
      ...prev,
      currentType: type,
      count: 0,
    }));
    setIsMenuOpen(false);
  };

  const toggleMode = () => {
    setState(prev => ({
      ...prev,
      isEndlessMode: !prev.isEndlessMode,
      count: 0,
      totalCount: 0,
      currentType: 'tasbih',
    }));
  };

  const resetCounter = () => {
    setState(prev => ({
      ...prev,
      count: 0,
      totalCount: 0,
      currentType: 'tasbih',
    }));
  };

  const getButtonText = () => {
    if (!state.isEndlessMode && state.totalCount === 99) {
      return 'اختم';
    }
    switch (state.currentType) {
      case 'tasbih':
        return 'سبّح';
      case 'tahmid':
        return 'اِحْمَدْ';
      case 'takbir':
        return 'كبّر';
      default:
        return 'سبّح';
    }
  };

  const getTypeTitle = (type: 'tasbih' | 'tahmid' | 'takbir') => {
    switch (type) {
      case 'tasbih':
        return 'التسبيح';
      case 'tahmid':
        return 'التحميد';
      case 'takbir':
        return 'التكبير';
    }
  };

  if (showAbout) {
    return <AboutPage onClose={() => setShowAbout(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-950 flex flex-col items-center justify-center p-4">
      <img 
        src="/dhikr-logo.png" 
        alt="تدبر الذكر" 
        className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain mb-2 dark:brightness-90"
      />
      
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-emerald-900/20 p-6 space-y-6 relative mb-8 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-90">
        <div className="flex flex-wrap justify-center items-center w-full gap-4">
          <button
            onClick={() => setShowNotificationSettings(true)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all duration-200"
            title={notificationsEnabled ? "إعدادات التنبيهات" : "تفعيل التنبيهات"}
          >
            <Bell 
              className={`w-5 h-5 ${
                notificationsEnabled 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-gray-400 dark:text-gray-600'
              }`} 
            />
            <span className="text-sm">التنبيهات</span>
          </button>

          {isInstallable && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all duration-200"
              title="تثبيت التطبيق"
            >
              <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm">تثبيت</span>
            </button>
          )}

          <button
            onClick={toggleMode}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all duration-200"
            title={state.isEndlessMode ? "وضع العد التقليدي" : "وضع العد المستمر"}
          >
            {state.isEndlessMode ? (
              <>
                <Hash className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm">تقليدي</span>
              </>
            ) : (
              <>
                <Infinity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm">مستمر</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all duration-200"
          >
            {isMenuOpen ? (
              <>
                <X className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm">إغلاق</span>
              </>
            ) : (
              <>
                <Menu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm">القائمة</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsDark(!isDark)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all duration-200"
          >
            {isDark ? (
              <>
                <Sun className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm">نهاري</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm">ليلي</span>
              </>
            )}
          </button>
        </div>

        <NextPrayerTime />

        <div className="text-center space-y-4">
          <div className="text-3xl font-arabic leading-loose text-gray-800 dark:text-gray-100">
            {getCurrentPhrase().text}
          </div>
          
          <div className="flex justify-center gap-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {getTypeTitle(state.currentType)}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {!state.isEndlessMode ? `${state.count}/33` : `العدد: ${state.count}`}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleCount}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-xl shadow-lg transform active:scale-95 transition-all duration-200"
          >
            <span className="text-xl">{getButtonText()}</span>
          </button>

          <button
            onClick={resetCounter}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm transition-all duration-200"
          >
            تصفير العداد
          </button>
        </div>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          المجموع: {state.totalCount}
          {!state.isEndlessMode && (
            <span className="mr-2">({Math.floor(state.totalCount / 33)}/3)</span>
          )}
        </div>

        <button
          onClick={() => setShowAbout(true)}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-emerald-900/50 transition-all duration-200 mx-auto mt-4 text-emerald-700 dark:text-emerald-300"
        >
          <Info className="w-5 h-5" />
          <span className="font-arabic">عن التطبيق</span>
        </button>

        {isMenuOpen && (
          <div className="absolute top-20 right-1/2 transform translate-x-1/2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-emerald-900/20 z-10 overflow-hidden backdrop-blur-sm bg-opacity-95 dark:bg-opacity-90">
            {(['tasbih', 'tahmid', 'takbir'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`w-full text-right px-4 py-3 text-sm transition-all duration-200
                  ${state.currentType === type 
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              >
                {getTypeTitle(type)}
              </button>
            ))}
          </div>
        )}

        {showNotificationSettings && (
          <NotificationSettings
            isOpen={showNotificationSettings}
            onClose={() => setShowNotificationSettings(false)}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={handleNotificationToggle}
            reminderTimes={reminderTimes}
            onUpdateReminderTimes={handleReminderTimesUpdate}
            prayerNotifications={prayerNotifications}
            onTogglePrayerNotifications={handlePrayerNotificationsToggle}
          />
        )}
      </div>

      <div className="text-center text-lg md:text-xl text-emerald-800 dark:text-emerald-200 font-arabic leading-relaxed max-w-md mx-auto px-4">
        صدقة جارية عن كل المسلمين الأحياء والأموات
        <br />
        صنعت بكل حب لله سبحانه وتعالى
        <br />
        اتباعًا لسنة نبيه الكريم محمد ﷺ
        <br />
        بواسطة مصطفى محمد تاج الدين
      </div>
    </div>
  );
}
