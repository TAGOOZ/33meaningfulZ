import { DhikrState } from '../types';

// Keys for localStorage
const STORAGE_KEYS = {
  DHIKR_STATE: 'dhikr_state',
  SETTINGS: 'dhikr_settings',
  STATS: 'dhikr_stats',
} as const;

interface DhikrSettings {
  isDark: boolean;
  notificationsEnabled: boolean;
  prayerNotifications: boolean;
  reminderTimes: number[];
}

interface DhikrStats {
  totalDhikr: number;
  dailyStats: Record<string, number>;
  lastUpdated: string;
}

// Maximum number of days to keep in stats
const MAX_DAYS_TO_KEEP = 30;

function cleanupOldData() {
  try {
    // Clean up old stats
    const stats = loadStats();
    if (stats) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - MAX_DAYS_TO_KEEP);
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

      // Keep only recent stats
      stats.dailyStats = Object.fromEntries(
        Object.entries(stats.dailyStats).filter(([date]) => date >= cutoffDateStr)
      );

      saveStats(stats);
    }
  } catch (error) {
    console.error('Error cleaning up old data:', error);
  }
}

// Run cleanup on module load
cleanupOldData();

export function saveDhikrState(state: DhikrState) {
  try {
    // Only save essential state data
    const minimalState = {
      count: state.count,
      currentType: state.currentType,
      displayMode: state.displayMode,
      totalCount: state.totalCount,
      isEndlessMode: state.isEndlessMode,
    };
    localStorage.setItem(STORAGE_KEYS.DHIKR_STATE, JSON.stringify(minimalState));
  } catch (error) {
    console.error('Error saving dhikr state:', error);
  }
}

export function loadDhikrState(): DhikrState | null {
  try {
    const state = localStorage.getItem(STORAGE_KEYS.DHIKR_STATE);
    return state ? JSON.parse(state) : null;
  } catch (error) {
    console.error('Error loading dhikr state:', error);
    return null;
  }
}

export function saveSettings(settings: DhikrSettings) {
  try {
    // Only save essential settings
    const minimalSettings = {
      isDark: settings.isDark,
      notificationsEnabled: settings.notificationsEnabled,
      prayerNotifications: settings.prayerNotifications,
      reminderTimes: settings.reminderTimes.map(time => Number(time.toFixed(2))), // Round to 2 decimal places
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(minimalSettings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export function loadSettings(): DhikrSettings | null {
  try {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Error loading settings:', error);
    return null;
  }
}

export function saveStats(stats: DhikrStats) {
  try {
    // Clean up old stats before saving
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_DAYS_TO_KEEP);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    // Keep only recent stats
    const cleanStats = {
      totalDhikr: stats.totalDhikr,
      dailyStats: Object.fromEntries(
        Object.entries(stats.dailyStats)
          .filter(([date]) => date >= cutoffDateStr)
          // Round numbers to integers
          .map(([date, count]) => [date, Math.round(count)])
      ),
      lastUpdated: stats.lastUpdated,
    };

    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(cleanStats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
}

export function loadStats(): DhikrStats | null {
  try {
    const stats = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!stats) return null;

    const parsedStats = JSON.parse(stats);
    
    // Ensure data integrity
    return {
      totalDhikr: Math.round(parsedStats.totalDhikr || 0),
      dailyStats: Object.fromEntries(
        Object.entries(parsedStats.dailyStats || {}).map(([date, count]) => [
          date,
          Math.round(Number(count) || 0),
        ])
      ),
      lastUpdated: parsedStats.lastUpdated || new Date().toISOString().split('T')[0],
    };
  } catch (error) {
    console.error('Error loading stats:', error);
    return null;
  }
}

export function updateDailyStats(count: number) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const stats = loadStats() || {
      totalDhikr: 0,
      dailyStats: {},
      lastUpdated: today,
    };

    // Update total count
    stats.totalDhikr = Math.round(stats.totalDhikr + count);

    // Update daily stats
    stats.dailyStats[today] = Math.round((stats.dailyStats[today] || 0) + count);

    // Clean up old stats
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_DAYS_TO_KEEP);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    stats.dailyStats = Object.fromEntries(
      Object.entries(stats.dailyStats)
        .filter(([date]) => date >= cutoffDateStr)
        .map(([date, value]) => [date, Math.round(Number(value))])
    );

    stats.lastUpdated = today;
    saveStats(stats);
  } catch (error) {
    console.error('Error updating daily stats:', error);
  }
}

// Clear all data except essential settings
export function clearOldData() {
  try {
    const settings = loadSettings();
    localStorage.clear();
    if (settings) {
      saveSettings(settings);
    }
  } catch (error) {
    console.error('Error clearing old data:', error);
  }
}