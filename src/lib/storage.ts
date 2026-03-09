import { get, set, del } from 'idb-keyval';

export interface BookRecord {
  id: string;
  title: string;
  originalText: string;
  parsedWords?: string[]; 
  lastReadIndex: number;
  addedAt: number;
}

export const Storage = {
  // Books (IndexedDB for large data)
  async saveBook(book: BookRecord): Promise<void> {
    await set(`book-${book.id}`, book);
  },

  async getBook(id: string): Promise<BookRecord | undefined> {
    return get(`book-${id}`);
  },

  async getAllBooks(): Promise<BookRecord[]> {
    // We would ideally use an index, but idb-keyval is simple KV.
    // For v1, we can store a master list of IDs.
    const ids = await get<string[]>('book-list') || [];
    const books: BookRecord[] = [];
    for (const id of ids) {
      const b = await this.getBook(id);
      if (b) books.push(b);
    }
    return books.sort((a, b) => b.addedAt - a.addedAt);
  },

  async registerBookId(id: string): Promise<void> {
    const ids = await get<string[]>('book-list') || [];
    if (!ids.includes(id)) {
      ids.push(id);
      await set('book-list', ids);
    }
  },

  async deleteBook(id: string): Promise<void> {
    await del(`book-${id}`);
    const ids = await get<string[]>('book-list') || [];
    await set('book-list', ids.filter(i => i !== id));
  },

  // Preferences (LocalStorage for small sync data)
  getWPM(): number {
    const val = localStorage.getItem('prefs-wpm');
    return val ? parseInt(val, 10) : 350; // Default 350 WPM
  },
  
  setWPM(wpm: number): void {
    localStorage.setItem('prefs-wpm', wpm.toString());
  },

  getFontFamily(): string {
    return localStorage.getItem('prefs-font') || 'Roboto';
  },

  setFontFamily(font: string): void {
    localStorage.setItem('prefs-font', font);
  },

  getFontSize(): number {
    const val = localStorage.getItem('prefs-fontSize');
    return val ? parseInt(val, 10) : 48; // Default RSVP size
  },

  setFontSize(size: number): void {
    localStorage.setItem('prefs-fontSize', size.toString());
  },

  getBgOpacity(): number {
    const val = localStorage.getItem('prefs-bgOpacity');
    return val ? parseInt(val, 10) : 60; // Default 60%
  },

  setBgOpacity(opacity: number): void {
    localStorage.setItem('prefs-bgOpacity', opacity.toString());
  },

  getBgBlur(): number {
    const val = localStorage.getItem('prefs-bgBlur');
    return val ? parseInt(val, 10) : 24; // Default 24px blur (backdrop-blur-2xl mapping)
  },

  setBgBlur(blur: number): void {
    localStorage.setItem('prefs-bgBlur', blur.toString());
  }
};
