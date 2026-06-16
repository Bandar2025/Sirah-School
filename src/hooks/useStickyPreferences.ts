/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

/**
 * Custom hook to manage persistent browser state for user preferences.
 * These are linked directly with local storage so they remain immune of reboots or logouts.
 */
export function useStickyPreferences<T>(key: string, defaultValue: T): [T, (newValue: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(`manara_pref_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`Error reading localStorage key "manara_pref_${key}":`, e);
      return defaultValue;
    }
  });

  const setStickyState = (newValue: T | ((prev: T) => T)) => {
    setState(prev => {
      const computed = newValue instanceof Function ? newValue(prev) : newValue;
      try {
        window.localStorage.setItem(`manara_pref_${key}`, JSON.stringify(computed));
      } catch (e) {
        console.warn(`Error writing localStorage key "manara_pref_${key}":`, e);
      }
      return computed;
    });
  };

  return [state, setStickyState];
}
