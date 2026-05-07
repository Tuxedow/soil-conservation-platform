import { useState, useEffect, useCallback } from 'react';

export interface ChatRecord {
  id: string;
  type: 'regulation_chat';
  question: string;
  answer: string;
  tags: string[];
  timestamp: number;
  favorite?: boolean;
}

const STORAGE_KEY = 'soil_conservation_chat_records';
const MAX_RECORDS = 100;

export function useChatRecords() {
  const [records, setRecords] = useState<ChatRecord[]>([]);

  // 加载历史记录
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch {
        setRecords([]);
      }
    }
  }, []);

  // 保存到 localStorage
  const saveRecords = useCallback((items: ChatRecord[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    setRecords(items);
  }, []);

  // 添加记录
  const addRecord = useCallback((item: Omit<ChatRecord, 'id' | 'timestamp'>) => {
    const newItem: ChatRecord = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    const updated = [newItem, ...records].slice(0, MAX_RECORDS);
    saveRecords(updated);
    return newItem;
  }, [records, saveRecords]);

  // 切换收藏状态
  const toggleFavorite = useCallback((id: string) => {
    const updated = records.map(item =>
      item.id === id ? { ...item, favorite: !item.favorite } : item
    );
    saveRecords(updated);
  }, [records, saveRecords]);

  // 删除记录
  const deleteRecord = useCallback((id: string) => {
    const updated = records.filter(item => item.id !== id);
    saveRecords(updated);
  }, [records, saveRecords]);

  // 清空所有记录
  const clearRecords = useCallback(() => {
    saveRecords([]);
  }, [saveRecords]);

  // 获取收藏列表
  const favorites = records.filter(item => item.favorite);

  return {
    records,
    favorites,
    addRecord,
    toggleFavorite,
    deleteRecord,
    clearRecords,
  };
}
