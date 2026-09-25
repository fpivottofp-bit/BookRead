import { Book, ReadingSettings } from '../types';

const BOOKS_KEY = 'bookreader_books';
const SETTINGS_KEY = 'bookreader_settings';

export const defaultSettings: ReadingSettings = {
  fontSize: 18,
  backgroundColor: '#1a1a2e',
  textColor: '#e0e0e0',
  lineHeight: 1.8,
  fontFamily: 'Georgia, serif',
};

export function loadBooks(): Book[] {
  try {
    const data = localStorage.getItem(BOOKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveBooks(books: Book[]): void {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export function loadSettings(): ReadingSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: ReadingSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
