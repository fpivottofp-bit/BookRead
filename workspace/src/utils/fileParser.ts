import mammoth from 'mammoth';

export async function parseDocxFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value;
}

export async function parseTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Convert line breaks to HTML paragraphs
      const html = text
        .split(/\n\n+/)
        .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`)
        .join('');
      resolve(html);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function splitContentIntoChapters(content: string): { title: string; content: string }[] {
  // Try to split by common chapter markers
  const chapterPattern = /(?:chapter|cap[íi]tulo|cap\.?)\s+(\d+|[ivxlcdm]+|[^\n]+)?/gi;
  const matches: { index: number; title: string }[] = [];
  
  let match;
  while ((match = chapterPattern.exec(content)) !== null) {
    matches.push({
      index: match.index,
      title: match[0].trim(),
    });
  }

  if (matches.length === 0) {
    // If no chapter markers found, split by heading tags or return as single chapter
    const headingPattern = /<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi;
    const headingMatches: { index: number; title: string }[] = [];
    
    while ((match = headingPattern.exec(content)) !== null) {
      headingMatches.push({
        index: match.index,
        title: match[1].replace(/<[^>]*>/g, '').trim(),
      });
    }

    if (headingMatches.length > 0) {
      return headingMatches.map((h, i) => ({
        title: h.title || `Capítulo ${i + 1}`,
        content: content.substring(
          h.index,
          headingMatches[i + 1]?.index
        ),
      }));
    }

    return [{ title: 'Capítulo 1', content }];
  }

  return matches.map((m, i) => ({
    title: m.title || `Capítulo ${i + 1}`,
    content: content.substring(
      m.index,
      matches[i + 1]?.index
    ),
  }));
}
