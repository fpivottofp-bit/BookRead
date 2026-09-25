import React, { useState, useRef } from 'react';
import { Book, Chapter } from '../types';
import { generateId } from '../utils/storage';
import { parseDocxFile, parseTextFile, splitContentIntoChapters } from '../utils/fileParser';

interface ChapterManagerProps {
  book: Book;
  onUpdateBook: (book: Book) => void;
  onBack: () => void;
  onStartReading: () => void;
}

export default function ChapterManager({ book, onUpdateBook, onBack, onStartReading }: ChapterManagerProps) {
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [editingChapter, setEditingChapter] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddChapter = () => {
    if (!chapterTitle.trim()) return;
    
    const newChapter: Chapter = {
      id: generateId(),
      title: chapterTitle.trim(),
      content: chapterContent,
      order: book.chapters.length,
    };

    const updatedBook = {
      ...book,
      chapters: [...book.chapters, newChapter],
    };
    onUpdateBook(updatedBook);
    setChapterTitle('');
    setChapterContent('');
    setShowAddChapter(false);
  };

  const handleUpdateChapter = () => {
    if (!editingChapter || !chapterTitle.trim()) return;
    
    const updatedChapters = book.chapters.map((ch) =>
      ch.id === editingChapter
        ? { ...ch, title: chapterTitle.trim(), content: chapterContent }
        : ch
    );

    onUpdateBook({ ...book, chapters: updatedChapters });
    setChapterTitle('');
    setChapterContent('');
    setEditingChapter(null);
    setShowAddChapter(false);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (!confirm('Excluir este capítulo?')) return;
    const updatedChapters = book.chapters
      .filter((ch) => ch.id !== chapterId)
      .map((ch, idx) => ({ ...ch, order: idx }));
    onUpdateBook({ ...book, chapters: updatedChapters });
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter.id);
    setChapterTitle(chapter.title);
    setChapterContent(chapter.content);
    setShowAddChapter(true);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      let content = '';
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.docx')) {
        content = await parseDocxFile(file);
      } else if (fileName.endsWith('.txt')) {
        content = await parseTextFile(file);
      } else if (fileName.endsWith('.doc')) {
        alert('Formato .doc não é suportado diretamente. Por favor, converta para .docx ou .txt');
        setImporting(false);
        return;
      } else {
        alert('Formato não suportado. Use .docx ou .txt');
        setImporting(false);
        return;
      }

      // Try to split into chapters
      const chapters = splitContentIntoChapters(content);
      
      const newChapters: Chapter[] = chapters.map((ch, idx) => ({
        id: generateId(),
        title: ch.title || `Capítulo ${book.chapters.length + idx + 1}`,
        content: ch.content,
        order: book.chapters.length + idx,
      }));

      const updatedBook = {
        ...book,
        chapters: [...book.chapters, ...newChapters],
      };
      onUpdateBook(updatedBook);
      
      if (newChapters.length > 1) {
        alert(`${newChapters.length} capítulos importados com sucesso!`);
      } else {
        alert('Arquivo importado com sucesso!');
      }
    } catch (error) {
      console.error('Error importing file:', error);
      alert('Erro ao importar arquivo. Verifique o formato.');
    }
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const moveChapter = (chapterId: string, direction: 'up' | 'down') => {
    const idx = book.chapters.findIndex((ch) => ch.id === chapterId);
    if (
      (direction === 'up' && idx === 0) ||
      (direction === 'down' && idx === book.chapters.length - 1)
    ) return;

    const newChapters = [...book.chapters];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newChapters[idx], newChapters[swapIdx]] = [newChapters[swapIdx], newChapters[idx]];
    
    const reordered = newChapters.map((ch, i) => ({ ...ch, order: i }));
    onUpdateBook({ ...book, chapters: reordered });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/10 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{book.title}</h1>
            {book.author && <p className="text-xs text-gray-400 truncate">{book.author}</p>}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4 pb-24">
        {/* Actions */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setShowAddChapter(!showAddChapter);
              setEditingChapter(null);
              setChapterTitle('');
              setChapterContent('');
            }}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-medium transition-colors"
          >
            {showAddChapter ? 'Cancelar' : '+ Adicionar Capítulo'}
          </button>
          <label className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-medium transition-colors text-center cursor-pointer flex items-center justify-center gap-1">
            {importing ? (
              <span>Importando...</span>
            ) : (
              <>
                <span>📄</span>
                <span>Importar Arquivo</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.txt"
              onChange={handleFileImport}
              className="hidden"
              disabled={importing}
            />
          </label>
        </div>

        {/* Info about supported formats */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4 text-xs text-gray-400">
          <p>📌 <strong>Formatos aceitos:</strong> .docx (Word) e .txt</p>
          <p className="mt-1">💡 O app tentará detectar capítulos automaticamente pelo texto "Capítulo" ou títulos no documento.</p>
        </div>

        {/* Add/Edit Chapter Form */}
        {showAddChapter && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 space-y-3">
            <h3 className="font-semibold text-sm">
              {editingChapter ? 'Editar Capítulo' : 'Novo Capítulo'}
            </h3>
            <input
              type="text"
              placeholder="Título do capítulo"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <textarea
              placeholder="Conteúdo do capítulo (pode usar HTML ou texto simples)..."
              value={chapterContent}
              onChange={(e) => setChapterContent(e.target.value)}
              rows={8}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <button
              onClick={editingChapter ? handleUpdateChapter : handleAddChapter}
              disabled={!chapterTitle.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors"
            >
              {editingChapter ? 'Salvar Alterações' : 'Adicionar Capítulo'}
            </button>
          </div>
        )}

        {/* Chapters List */}
        {book.chapters.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-gray-400">Nenhum capítulo ainda</p>
            <p className="text-gray-500 text-sm mt-1">Adicione capítulos manualmente ou importe um arquivo</p>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Capítulos ({book.chapters.length})</h3>
            {book.chapters.map((chapter, idx) => (
              <div
                key={chapter.id}
                className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3"
              >
                <span className="text-gray-500 text-sm w-6 text-center">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{chapter.title}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {chapter.content.replace(/<[^>]*>/g, '').substring(0, 60)}...
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveChapter(chapter.id, 'up')}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400"
                    disabled={idx === 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveChapter(chapter.id, 'down')}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400"
                    disabled={idx === book.chapters.length - 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEditChapter(chapter)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-blue-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteChapter(chapter.id)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-red-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Start Reading Button */}
      {book.chapters.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#16213e] via-[#16213e]/95 to-transparent">
          <button
            onClick={onStartReading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-4 rounded-2xl font-semibold text-lg transition-colors shadow-lg shadow-indigo-600/30"
          >
            📖 {book.lastReadAt ? 'Continuar Lendo' : 'Começar a Ler'}
          </button>
        </div>
      )}
    </div>
  );
}
