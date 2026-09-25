import React from 'react';
import { Book } from '../types';

interface BookListProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onAddBook: () => void;
  onDeleteBook: (bookId: string) => void;
}

export default function BookList({ books, onSelectBook, onAddBook, onDeleteBook }: BookListProps) {
  const sortedBooks = [...books].sort((a, b) => 
    (b.lastReadAt || b.createdAt) - (a.lastReadAt || a.createdAt)
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1a1a2e, #16213e)', color: 'white' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: 'rgba(26, 26, 46, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>📚</span>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>BookReader</h1>
          </div>
          <button
            type="button"
            onClick={onAddBook}
            style={{
              backgroundColor: '#4f46e5',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>+</span>
            <span>Novo Livro</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ padding: '16px', paddingBottom: '80px' }}>
        {sortedBooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📖</div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#d1d5db' }}>
              Nenhum livro ainda
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Adicione seu primeiro livro para começar a ler
            </p>
            <button
              type="button"
              onClick={onAddBook}
              style={{
                backgroundColor: '#4f46e5',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Adicionar Livro
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedBooks.map((book) => (
              <div
                key={book.id}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0,
                  }}>
                    📕
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                      }}
                      onClick={() => onSelectBook(book)}
                    >
                      {book.title}
                    </h3>
                    {book.author && (
                      <p style={{ color: '#9ca3af', fontSize: '14px', margin: '4px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {book.author}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                      <span>{book.chapters.length} {book.chapters.length === 1 ? 'capítulo' : 'capítulos'}</span>
                      {book.lastReadAt && (
                        <span>• Lido {new Date(book.lastReadAt).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Excluir "${book.title}"?`)) {
                        onDeleteBook(book.id);
                      }
                    }}
                    style={{
                      color: 'rgba(248, 113, 113, 0.6)',
                      padding: '8px',
                      marginRight: '-8px',
                      marginTop: '-4px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectBook(book)}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    color: '#a5b4fc',
                    padding: '8px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {book.lastReadAt ? 'Continuar Lendo' : 'Começar a Ler'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
