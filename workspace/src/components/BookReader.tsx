import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Book, ReadingSettings, Chapter } from '../types';
import { ThemePreset } from '../types';

interface BookReaderProps {
  book: Book;
  settings: ReadingSettings;
  onUpdateSettings: (settings: ReadingSettings) => void;
  onUpdateBook: (book: Book) => void;
  onBack: () => void;
  onManageChapters: () => void;
}

const themePresets: ThemePreset[] = [
  { name: 'Escuro', bg: '#1a1a2e', text: '#e0e0e0', icon: '🌙' },
  { name: 'Sépia', bg: '#f4ecd8', text: '#5b4636', icon: '📜' },
  { name: 'Claro', bg: '#ffffff', text: '#333333', icon: '☀️' },
  { name: 'Verde', bg: '#c7efc9', text: '#2d3436', icon: '🌿' },
  { name: 'Azul', bg: '#dceefb', text: '#1a365d', icon: '🌊' },
  { name: 'Rosa', bg: '#fce4ec', text: '#4a1942', icon: '🌸' },
  { name: 'Cinza', bg: '#2d2d2d', text: '#b0b0b0', icon: '⚫' },
  { name: 'Preto', bg: '#000000', text: '#cccccc', icon: '⬛' },
];

export default function BookReader({
  book,
  settings,
  onUpdateSettings,
  onUpdateBook,
  onBack,
  onManageChapters,
}: BookReaderProps) {
  const [showSettings, setShowSettings] = useState(true); // Sempre visível por padrão
  const [showChapterList, setShowChapterList] = useState(false);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Find current chapter index from saved state
  useEffect(() => {
    if (book.currentChapterId) {
      const idx = book.chapters.findIndex((ch) => ch.id === book.currentChapterId);
      if (idx >= 0) {
        setCurrentChapterIdx(idx);
      }
    }
  }, [book.currentChapterId, book.chapters]);

  // Restore scroll position
  useEffect(() => {
    if (contentRef.current && book.scrollPosition) {
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = book.scrollPosition || 0;
        }
      }, 100);
    }
  }, [currentChapterIdx]);

  const currentChapter: Chapter | undefined = book.chapters[currentChapterIdx];

  const saveProgress = useCallback(() => {
    if (!currentChapter) return;
    const scrollPos = contentRef.current?.scrollTop || 0;
    onUpdateBook({
      ...book,
      currentChapterId: currentChapter.id,
      scrollPosition: scrollPos,
      lastReadAt: Date.now(),
    });
  }, [book, currentChapter, onUpdateBook]);

  // Save progress on unmount and chapter change
  useEffect(() => {
    return () => {
      saveProgress();
    };
  }, [currentChapterIdx]);

  // Save progress periodically
  useEffect(() => {
    const interval = setInterval(saveProgress, 10000);
    return () => clearInterval(interval);
  }, [saveProgress]);

  const goToChapter = (idx: number) => {
    saveProgress();
    setCurrentChapterIdx(idx);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    setShowChapterList(false);
  };

  const nextChapter = () => {
    if (currentChapterIdx < book.chapters.length - 1) {
      goToChapter(currentChapterIdx + 1);
    }
  };

  const prevChapter = () => {
    if (currentChapterIdx > 0) {
      goToChapter(currentChapterIdx - 1);
    }
  };

  const changeFontSize = (delta: number) => {
    const newSize = Math.max(12, Math.min(36, settings.fontSize + delta));
    onUpdateSettings({ ...settings, fontSize: newSize });
  };

  const changeTheme = (preset: ThemePreset) => {
    onUpdateSettings({
      ...settings,
      backgroundColor: preset.bg,
      textColor: preset.text,
    });
  };

  const changeLineHeight = (delta: number) => {
    const newHeight = Math.max(1.2, Math.min(3.0, +(settings.lineHeight + delta).toFixed(1)));
    onUpdateSettings({ ...settings, lineHeight: newHeight });
  };

  if (!currentChapter) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: settings.backgroundColor,
        color: settings.textColor
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>Nenhum capítulo disponível</p>
          <button onClick={onBack} style={{ marginTop: '16px', textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Voltar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: settings.backgroundColor,
      color: settings.textColor,
      overflow: 'hidden'
    }}>
      {/* Header - Sempre visível */}
      <header style={{
        flexShrink: 0,
        backgroundColor: settings.backgroundColor,
        borderBottom: `1px solid ${settings.textColor}20`,
        padding: '12px 16px',
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => { saveProgress(); onBack(); }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: settings.textColor, 
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
            <p style={{ fontSize: '12px', opacity: 0.6, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</p>
            <p style={{ fontSize: '14px', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentChapter.title}</p>
          </div>
          <button
            onClick={() => setShowChapterList(true)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: settings.textColor, 
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Reading Content - Scrollável */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '24px 20px',
          fontFamily: settings.fontFamily,
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          className="reader-content"
          dangerouslySetInnerHTML={{ __html: currentChapter.content }}
          style={{ wordBreak: 'break-word', maxWidth: '100%' }}
        />
      </div>

      {/* Settings Panel - Sempre visível */}
      {showSettings && (
        <div style={{
          flexShrink: 0,
          backgroundColor: settings.backgroundColor,
          borderTop: `1px solid ${settings.textColor}20`,
          padding: '16px',
          maxHeight: '50vh',
          overflowY: 'auto',
        }}>
          {/* Font Size */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px', display: 'block' }}>
              Tamanho da Fonte: {settings.fontSize}px
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => changeFontSize(-2)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  border: `1px solid ${settings.textColor}40`,
                  backgroundColor: 'transparent',
                  color: settings.textColor,
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                A-
              </button>
              <div style={{ flex: 1, textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                {settings.fontSize}
              </div>
              <button
                onClick={() => changeFontSize(2)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  border: `1px solid ${settings.textColor}40`,
                  backgroundColor: 'transparent',
                  color: settings.textColor,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                A+
              </button>
            </div>
          </div>

          {/* Line Height */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px', display: 'block' }}>
              Espaçamento: {settings.lineHeight.toFixed(1)}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => changeLineHeight(-0.2)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  border: `1px solid ${settings.textColor}40`,
                  backgroundColor: 'transparent',
                  color: settings.textColor,
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                ≡
              </button>
              <div style={{ flex: 1, textAlign: 'center', fontSize: '18px' }}>
                {settings.lineHeight.toFixed(1)}
              </div>
              <button
                onClick={() => changeLineHeight(0.2)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  border: `1px solid ${settings.textColor}40`,
                  backgroundColor: 'transparent',
                  color: settings.textColor,
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                ≡
              </button>
            </div>
          </div>

          {/* Theme/Background Color */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', opacity: 0.7, marginBottom: '12px', display: 'block' }}>
              Cor de Fundo
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {themePresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => changeTheme(preset)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: settings.backgroundColor === preset.bg ? '2px solid #4f46e5' : '2px solid transparent',
                    backgroundColor: preset.bg,
                    color: preset.text,
                    cursor: 'pointer',
                    transform: settings.backgroundColor === preset.bg ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{preset.icon}</span>
                  <span style={{ fontSize: '11px' }}>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px', display: 'block' }}>
              Fonte
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {[
                { name: 'Georgia', value: 'Georgia, serif' },
                { name: 'Sans-serif', value: '-apple-system, BlinkMacSystemFont, sans-serif' },
                { name: 'Serif', value: '"Times New Roman", serif' },
                { name: 'Monospace', value: '"Courier New", monospace' },
              ].map((font) => (
                <button
                  key={font.name}
                  onClick={() => onUpdateSettings({ ...settings, fontFamily: font.value })}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: settings.fontFamily === font.value ? '2px solid #4f46e5' : `1px solid ${settings.textColor}40`,
                    backgroundColor: settings.fontFamily === font.value ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                    color: settings.textColor,
                    fontSize: '14px',
                    fontFamily: font.value,
                    cursor: 'pointer',
                  }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>

          {/* Manage Chapters */}
          <button
            onClick={() => {
              saveProgress();
              onManageChapters();
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: `1px solid ${settings.textColor}40`,
              backgroundColor: 'transparent',
              color: settings.textColor,
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            📝 Gerenciar Capítulos
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div style={{
        flexShrink: 0,
        backgroundColor: settings.backgroundColor,
        borderTop: `1px solid ${settings.textColor}20`,
        padding: '12px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={prevChapter}
            disabled={currentChapterIdx === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 12px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              color: settings.textColor,
              cursor: currentChapterIdx === 0 ? 'not-allowed' : 'pointer',
              opacity: currentChapterIdx === 0 ? 0.3 : 1,
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span style={{ fontSize: '14px' }}>Anterior</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                padding: '8px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'transparent',
                color: settings.textColor,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
            <span style={{ fontSize: '12px', opacity: 0.5 }}>
              {currentChapterIdx + 1}/{book.chapters.length}
            </span>
          </div>

          <button
            onClick={nextChapter}
            disabled={currentChapterIdx === book.chapters.length - 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 12px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              color: settings.textColor,
              cursor: currentChapterIdx === book.chapters.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentChapterIdx === book.chapters.length - 1 ? 0.3 : 1,
            }}
          >
            <span style={{ fontSize: '14px' }}>Próximo</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chapter List Panel */}
      {showChapterList && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
        }} onClick={() => setShowChapterList(false)}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }} />
          <div
            style={{
              position: 'relative',
              width: '320px',
              maxWidth: '85vw',
              height: '100%',
              overflowY: 'auto',
              backgroundColor: settings.backgroundColor,
              color: settings.textColor,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              position: 'sticky',
              top: 0,
              padding: '16px',
              borderBottom: `1px solid ${settings.textColor}20`,
              backgroundColor: settings.backgroundColor,
            }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '18px', margin: 0 }}>Capítulos</h3>
              <p style={{ fontSize: '12px', opacity: 0.5, margin: '4px 0 0 0' }}>{book.title}</p>
            </div>
            <div style={{ padding: '8px' }}>
              {book.chapters.map((chapter, idx) => (
                <button
                  key={chapter.id}
                  onClick={() => goToChapter(idx)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px',
                    borderRadius: '12px',
                    marginBottom: '4px',
                    border: idx === currentChapterIdx ? '1px solid rgba(79, 70, 229, 0.3)' : 'none',
                    backgroundColor: idx === currentChapterIdx ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                    color: settings.textColor,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '12px', opacity: 0.4, width: '24px' }}>{idx + 1}</span>
                  <span style={{ fontSize: '14px', fontWeight: idx === currentChapterIdx ? 'bold' : 'normal' }}>
                    {chapter.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
