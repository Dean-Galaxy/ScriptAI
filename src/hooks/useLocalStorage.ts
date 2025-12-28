import { useState, useCallback } from 'react';

/**
 * 自定义 Hook，用于将 state 同步到 localStorage
 * @param key - localStorage 的键名
 * @param initialValue - 初始值
 * @returns [storedValue, setValue] - 存储的值和更新函数
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // 从 localStorage 读取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 更新 state 和 localStorage 的函数
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // 支持函数式更新 - 使用函数式 setState 来获取最新值
        setStoredValue((prevValue) => {
          const valueToStore = value instanceof Function ? value(prevValue) : value;
          
          // 保存到 localStorage
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
          
          return valueToStore;
        });
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

