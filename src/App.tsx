import { useEffect } from 'react';
import { useReaderValue } from './context/ReaderContext';
import { LibraryManager } from './components/LibraryManager';
import { ReaderOverlay } from './components/ReaderOverlay';
import { ReaderControls } from './components/ReaderControls';

function AppContent() {
  const { activeBook } = useReaderValue();

  const { togglePlay, wpm, setWPM, currentIndex, setIndex, bgOpacity, setBgOpacity, bgBlur, setBgBlur } = useReaderValue();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (document.activeElement?.tagName === 'INPUT') return;

        if (e.code === 'Space' && activeBook) {
            e.preventDefault();
            togglePlay();
        } else if (e.code === 'ArrowUp' && activeBook) {
            e.preventDefault();
            setWPM(Math.min(wpm + 25, 1000));
        } else if (e.code === 'ArrowDown' && activeBook) {
            e.preventDefault();
            setWPM(Math.max(wpm - 25, 50));
        } else if (e.code === 'ArrowLeft' && activeBook) {
            e.preventDefault();
            setIndex(Math.max(currentIndex - 15, 0));
        } else if (e.code === 'ArrowRight' && activeBook) {
            e.preventDefault();
            setIndex(Math.min(currentIndex + 15, (activeBook.parsedWords?.length || 1) - 1));
        } else if (e.code === 'KeyW' && activeBook) {
            e.preventDefault();
            setBgOpacity(Math.min(bgOpacity + 5, 100));
        } else if (e.code === 'KeyS' && activeBook) {
            e.preventDefault();
            setBgOpacity(Math.max(bgOpacity - 5, 0));
        } else if (e.code === 'KeyD' && activeBook) {
            e.preventDefault();
            setBgBlur(Math.min(bgBlur + 2, 60));
        } else if (e.code === 'KeyA' && activeBook) {
            e.preventDefault();
            setBgBlur(Math.max(bgBlur - 2, 0));
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBook, togglePlay, wpm, setWPM, currentIndex, setIndex, bgOpacity, setBgOpacity, bgBlur, setBgBlur]);

  return (
    <div className="font-sans min-h-screen bg-white dark:bg-black selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors duration-300">
      {!activeBook ? (
        <LibraryManager />
      ) : (
        <>
            <ReaderOverlay />
            <ReaderControls />
        </>
      )}
    </div>
  );
}

export default AppContent;
