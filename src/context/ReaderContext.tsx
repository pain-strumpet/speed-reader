import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Storage, BookRecord } from '../lib/storage';

interface ReaderState {
  activeBook: BookRecord | null;
  isPlaying: boolean;
  currentIndex: number;
  wpm: number;
  fontFamily: string;
  fontSize: number; // For RSVP Display
  bgOpacity: number; // 0 to 100
  bgBlur: number;    // pixel blur amount
  
  // Actions
  setActiveBook: (book: BookRecord | null) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setIndex: (index: number) => void;
  setWPM: (wpm: number) => void;
  setFontFamily: (font: string) => void;
  setFontSize: (size: number) => void;
  setBgOpacity: (opacity: number) => void;
  setBgBlur: (blur: number) => void;
}

const ReaderContext = createContext<ReaderState | undefined>(undefined);

export const ReaderProvider = ({ children }: { children: ReactNode }) => {
  const [activeBook, setActiveBookState] = useState<BookRecord | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Preferences loaded from LocalStorage
  const [wpm, setWpmState] = useState(350);
  const [fontFamily, setFontFamilyState] = useState('Roboto');
  const [fontSize, setFontSizeState] = useState(48);
  const [bgOpacity, setBgOpacityState] = useState(60);
  const [bgBlur, setBgBlurState] = useState(24);

  useEffect(() => {
    // Load saved preferences on mount
    setWpmState(Storage.getWPM());
    setFontFamilyState(Storage.getFontFamily());
    setFontSizeState(Storage.getFontSize());
    setBgOpacityState(Storage.getBgOpacity());
    setBgBlurState(Storage.getBgBlur());
  }, []);

  const setActiveBook = (book: BookRecord | null) => {
    setActiveBookState(book);
    setIsPlaying(false);
    if (book) {
      setCurrentIndex(book.lastReadIndex || 0);
    } else {
      setCurrentIndex(0);
    }
  };

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const togglePlay = () => setIsPlaying(prev => !prev);
  
  const setIndex = (index: number) => {
    setCurrentIndex(index);
    if (activeBook) {
        // Debounce or save periodically in a real scenario, saving immediately for prototype
        Storage.saveBook({ ...activeBook, lastReadIndex: index });
    }
  };

  const setWPM = (newWPM: number) => {
    setWpmState(newWPM);
    Storage.setWPM(newWPM);
  };

  const setFontFamily = (font: string) => {
    setFontFamilyState(font);
    Storage.setFontFamily(font);
  };

  const setFontSize = (size: number) => {
    setFontSizeState(size);
    Storage.setFontSize(size);
  }

  const setBgOpacity = (opacity: number) => {
    setBgOpacityState(opacity);
    Storage.setBgOpacity(opacity);
  }

  const setBgBlur = (blur: number) => {
    setBgBlurState(blur);
    Storage.setBgBlur(blur);
  }

  return (
    <ReaderContext.Provider 
      value={{
        activeBook, isPlaying, currentIndex, wpm, fontFamily, fontSize,
        bgOpacity, bgBlur,
        setActiveBook, play, pause, togglePlay, setIndex, setWPM, setFontFamily, setFontSize,
        setBgOpacity, setBgBlur
      }}
    >
      {children}
    </ReaderContext.Provider>
  );
};

export const useReaderValue = () => {
  const context = useContext(ReaderContext);
  if (context === undefined) {
    throw new Error('useReaderValue must be used within a ReaderProvider');
  }
  return context;
};
