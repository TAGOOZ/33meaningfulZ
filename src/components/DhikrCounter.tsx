import React, { useState, useEffect } from 'react';
import { Moon, Sun, List, Maximize2 } from 'lucide-react';
import { dhikrPhrases } from '../data/phrases';
import type { DhikrState } from '../types';

export default function DhikrCounter() {
  const [state, setState] = useState<DhikrState>({
    count: 0,
    currentType: 'tasbih',
    displayMode: 'dynamic',
    totalCount: 0,
  });

  const [isDark, setIsDark] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const getCurrentPhrase = () => {
    if (state.totalCount === 99) {
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

      if (newTotalCount === 100) {
        // Reset everything after the special 100th phrase
        return {
          count: 0,
          currentType: 'tasbih',
          displayMode: prev.displayMode,
          totalCount: 0,
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

      return { 
        ...prev, 
        count: newCount, 
        totalCount: newTotalCount 
      };
    });
  };

  const toggleDisplayMode = () => {
    setState(prev => ({
      ...prev,
      displayMode: prev.displayMode === 'dynamic' ? 'list' : 
                  prev.displayMode === 'list' ? 'focus' : 'dynamic',
    }));
  };

  const getButtonText = () => {
    if (state.totalCount === 99) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
            ذِكر
          </h1>
          <div className="flex gap-2">
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
            <button
              onClick={toggleDisplayMode}
              className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors"
            >
              {state.displayMode === 'dynamic' ? (
                <List className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : state.displayMode === 'list' ? (
                <Maximize2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Sun className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
            </button>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="text-3xl font-arabic leading-loose text-gray-800 dark:text-gray-200">
            {getCurrentPhrase().text}
          </div>
          
          <div className="flex justify-center gap-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {state.currentType === 'tasbih' ? 'التسبيح' :
               state.currentType === 'tahmid' ? 'التحميد' : 'التكبير'}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {state.count}/33
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
        </div>
      </div>
    </div>
  );
}