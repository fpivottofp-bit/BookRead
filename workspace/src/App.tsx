import React, { useState, useEffect, useCallback } from 'react';
import { Book, ReadingSettings } from './types';
import { loadBooks, saveBooks, loadSettings, saveSettings } from './utils/storage';
import BookList from './components/BookList';
import BookReader from './components/BookReader';
import ChapterManager from './components/ChapterManager';
import AddBookModal from './components/AddBookModal';

type Screen = 'list' | 'manage' | 'read';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [settings, setSettings] = useState<ReadingSettings>(loadSettings());
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load books on mount
  useEffect(() => {
    setBooks(loadBooks());
  }, []);

  // Save books whenever they change
  useEffect(() => {
    if (books.length > 0 || localStorage.getItem('bookreader_books')) {
      saveBooks(books);
    }
  }, [books]);

  // Save settings whenever they change
  const handleUpdateSettings = useCallback((newSettings: ReadingSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  const selectedBook = books.find((b) => b.id === selectedBookId) || null;

  const handleAddBook = (book: Book) => {
    setBooks([...books, book]);
    setShowAddModal(false);
    setSelectedBookId(book.id);
    setCurrentScreen('manage');
  };

  const handleUpdateBook = (updatedBook: Book) => {
    setBooks(books.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
  };

  const handleDeleteBook = (bookId: string) => {
    setBooks(books.filter((b) => b.id !== bookId));
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBookId(book.id);
    if (book.chapters.length > 0) {
      setCurrentScreen('read');
    } else {
      setCurrentScreen('manage');
    }
  };

  const handleBack = () => {
    if (currentScreen === 'read') {
      setCurrentScreen('manage');
    } else if (currentScreen === 'manage') {
      setCurrentScreen('list');
      setSelectedBookId(null);
    }
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  return (
    <>
      {currentScreen === 'list' && (
        <div className="max-w-lg mx-auto min-h-screen">
          <BookList
            books={books}
            onSelectBook={handleSelectBook}
            onAddBook={handleOpenAddModal}
            onDeleteBook={handleDeleteBook}
          />
        </div>
      )}

      {currentScreen === 'manage' && selectedBook && (
        <div className="max-w-lg mx-auto min-h-screen">
          <ChapterManager
            book={selectedBook}
            onUpdateBook={handleUpdateBook}
            onBack={handleBack}
            onStartReading={() => setCurrentScreen('read')}
          />
        </div>
      )}

      {currentScreen === 'read' && selectedBook && (
        <BookReader
          book={selectedBook}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onUpdateBook={handleUpdateBook}
          onBack={handleBack}
          onManageChapters={() => setCurrentScreen('manage')}
        />
      )}

      {showAddModal && (
        <AddBookModal
          onAdd={handleAddBook}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
}
