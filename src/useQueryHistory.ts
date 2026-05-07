import { useState, useEffect, useCallback } from 'react';

export interface QueryHistoryItem {
  id: string;
  type: 'map' | 'sensitive';
  location: string;
  coordinates?: { lat: number; lng: number };
  result: any;
  timestamp: number;
  favorite?: boolean;
}

const STORAGE_KEY = 'soil_conservation_history';

export function useQueryHistory() {
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);

  // 加载历史记录
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  // 保存到 localStorage
  const saveHistory = useCallback((items: QueryHistoryItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    setHistory(items);
  }, []);

  // 添加查询记录
  const addHistory = useCallback((item: Omit<QueryHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: QueryHistoryItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    const updated = [newItem, ...history].slice(0, 50); // 最多保留50条
    saveHistory(updated);
    return newItem;
  }, [history, saveHistory]);

  // 切换收藏状态
  const toggleFavorite = useCallback((id: string) => {
    const updated = history.map(item =>
      item.id === id ? { ...item, favorite: !item.favorite } : item
    );
    saveHistory(updated);
  }, [history, saveHistory]);

  // 删除记录
  const deleteHistory = useCallback((id: string) => {
    const updated = history.filter(item => item.id !== id);
    saveHistory(updated);
  }, [history, saveHistory]);

  // 清空历史
  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  // 获取收藏列表
  const favorites = history.filter(item => item.favorite);

  return {
    history,
    favorites,
    addHistory,
    toggleFavorite,
    deleteHistory,
    clearHistory,
  };
}
