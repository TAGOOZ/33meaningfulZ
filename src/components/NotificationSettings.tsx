import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  reminderTimes: number[];
  onUpdateReminderTimes: (times: number[]) => void;
  prayerNotifications: boolean;
  onTogglePrayerNotifications: () => void;
}

interface TimePickerProps {
  value: number;
  onChange: (hour: number, minute: number) => void;
  disabled?: boolean;
}

function TimePicker({ value, onChange, disabled = false }: TimePickerProps) {
  const hour = Math.floor(value);
  const minute = Math.round((value - hour) * 60);

  return (
    <div className="flex gap-2 items-center" dir="ltr">
      <select
        value={hour}
        onChange={(e) => onChange(parseInt(e.target.value, 10), minute)}
        disabled={disabled}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
      >
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i}>
            {i.toString().padStart(2, '0')}
          </option>
        ))}
      </select>
      <span className="text-gray-600 dark:text-gray-400">:</span>
      <select
        value={minute}
        onChange={(e) => onChange(hour, parseInt(e.target.value, 10))}
        disabled={disabled}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
      >
        {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
          <option key={minute} value={minute}>
            {minute.toString().padStart(2, '0')}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function NotificationSettings({
  isOpen,
  onClose,
  notificationsEnabled,
  onToggleNotifications,
  reminderTimes,
  onUpdateReminderTimes,
  prayerNotifications,
  onTogglePrayerNotifications,
}: NotificationSettingsProps) {
  const [tempTimes, setTempTimes] = useState(reminderTimes);

  if (!isOpen) return null;

  const handleTimeChange = (index: number, hour: number, minute: number) => {
    const newTimes = [...tempTimes];
    newTimes[index] = hour + (minute / 60);
    setTempTimes(newTimes);
  };

  const handleSaveTimes = () => {
    onUpdateReminderTimes(tempTimes);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" dir="rtl">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pr-4">
          إعدادات التنبيهات
        </h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white">تفعيل التنبيهات</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationsEnabled}
                onChange={onToggleNotifications}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:translate-x-[-100%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white">تنبيهات الصلاة</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={prayerNotifications}
                onChange={onTogglePrayerNotifications}
                disabled={!notificationsEnabled}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:translate-x-[-100%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-900 dark:text-white font-bold">
                أوقات تذكير الأذكار
              </h3>
              <button
                onClick={handleSaveTimes}
                disabled={!notificationsEnabled}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>حفظ</span>
              </button>
            </div>
            {tempTimes.map((time, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-gray-900 dark:text-white">
                  التذكير {index + 1}
                </span>
                <TimePicker
                  value={time}
                  onChange={(hour, minute) => handleTimeChange(index, hour, minute)}
                  disabled={!notificationsEnabled}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}