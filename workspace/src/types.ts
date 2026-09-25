export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  chapters: Chapter[];
  createdAt: number;
  lastReadAt?: number;
  currentChapterId?: string;
  scrollPosition?: number;
}

export interface ReadingSettings {
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  lineHeight: number;
  fontFamily: string;
}

export type ThemePreset = {
  name: string;
  bg: string;
  text: string;
  icon: string;
};
