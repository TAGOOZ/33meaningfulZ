import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, Infinity, Hash, Download, Info, Bell } from 'lucide-react';
import { dhikrPhrases } from '../data/phrases';
import type { DhikrState } from '../types';
import AboutPage from './AboutPage';
import NextPrayerTime from './NextPrayerTime';
import NotificationSettings from './NotificationSettings';
import { setupNotifications, scheduleNotifications, clearAllNotifications } from '../utils/notifications';

export default function DhikrCounter() {
  const [state, setState] = useState<DhikrState>({
    count: 0,
    currentType: 'tasbih',
    displayMode: 'dynamic',
    totalCount: 0,
    isEndlessMode: false,
  });

  const [isDark, setIsDark] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [prayerNotifications, setPrayerNotifications] = useState(true);
  const [reminderTimes, setReminderTimes] = useState([9, 14, 17]); // Default reminder times

  useEffect(() => {
    // Check if notifications are already enabled
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6 relative">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
            تدبر الذكر
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNotificationSettings(true)}
              className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors"
              title={notificationsEnabled ? "إعدادات التنبيهات" : "تفعيل التنبيهات"}
            >
              <Bell 
                className={`w-5 h-5 ${
                  notificationsEnabled 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-400 dark:text-gray-600'
                }`} 
              />
            </button>
            <button
              onClick={() => setShowAbout(true)}
              className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors"
              title="عن التطبيق"
            >
              <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </button>
            {isInstallable && (
              <button
                onClick={handleInstall}
                className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors"
                title="تثبيت التطبيق"
              >
                <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </button>
            )}
            <button
              onClick={toggleMode}
              className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors"
              title={state.isEndlessMode ? "وضع العد التقليدي" : "وضع العد المستمر"}
            >
              {state.isEndlessMode ? (
                <Hash className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Infinity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Menu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
            </button>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Moon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
            </button>
          </div>
        </div>

        <NextPrayerTime />

        <div className="text-center space-y-4">
          <div className="text-3xl font-arabic leading-loose text-gray-800 dark:text-gray-200">
            {getCurrentPhrase().text}
          </div>
          
          <div className="flex justify-center gap-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {getTypeTitle(state.currentType)}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {!state.isEndlessMode ? `${state.count}/33` : `العدد: ${state.count}`}
            </div>
          </div>
        </div>

        <button
          onClick={handleCount}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg transform active:scale-95 transition-transform"
        >
          <span className="text-xl">{getButtonText()}</span>
        </button>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          المجموع: {state.totalCount}
          {!state.isEndlessMode && (
            <span className="mr-2">({Math.floor(state.totalCount / 33)}/3)</span>
          )}
        </div>

        {isMenuOpen && (
          <div className="absolute top-20 right-6 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-10 overflow-hidden">
            {(['tasbih', 'tahmid', 'takbir'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`w-full text-right px-4 py-3 text-sm transition-colors
                  ${state.currentType === type 
                    ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'}`}
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
    </div>
  );
}