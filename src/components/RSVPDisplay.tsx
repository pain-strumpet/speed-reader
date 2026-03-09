import React from 'react';
import { useReaderValue } from '../context/ReaderContext';
import { calculateORP } from '../engine/textProcessor';

export const RSVPDisplay: React.FC = () => {
    const { activeBook, currentIndex, fontFamily, fontSize } = useReaderValue();

    if (!activeBook || !activeBook.parsedWords || activeBook.parsedWords.length === 0) {
        return <div className="text-center text-gray-500 mt-20">No book loaded</div>;
    }

    const currentWord = activeBook.parsedWords[currentIndex] || '';
    const { left, center, right } = calculateORP(currentWord);

    // Dynamic Font Family Mapping
    const getFontClass = (name: string) => {
        switch (name) {
            case 'Dark Courier': return 'font-mono font-bold tracking-tight'; // We'll use Courier Prime as the graceful fallback for Dark Courier
            case 'Times New Roman': return 'font-serif';
            case 'Inter': return 'font-sans font-medium';
            case 'Roboto': return 'font-sans font-medium';
            default: return 'font-sans';
        }
    }

    return (
        <div className="absolute top-[18%] left-0 w-full flex justify-center items-center pointer-events-none z-10 px-4">
            {/* The RSVP Container needs a solid background backing to ensure legible text over the blurred background */}
            <div 
                className={`bg-white/95 dark:bg-zinc-900/95 shadow-lg rounded-xl inline-grid grid-cols-[1fr_auto_1fr] items-center justify-items-center min-w-[300px] max-w-[90vw] transition-all duration-200 backdrop-blur-md border border-gray-200 dark:border-zinc-800 ${getFontClass(fontFamily)}`}
                style={{ 
                    height: `${fontSize * 2.5}px`, 
                    fontSize: `${fontSize}px` 
                }}
            >
                {/* 
                    The alignment trick for ORP:
                    By using CSS Grid 1fr auto 1fr, the left and right sides will always share an equal amount 
                    of the container, expanding geometrically around the 'auto' center focal point.
                */}
                <div className="justify-self-end text-right pr-[1px] text-gray-800 dark:text-gray-100 whitespace-pre">
                    {left}
                </div>
                
                <div className="text-red-600 font-bold whitespace-pre z-20">
                    {center}
                </div>

                <div className="justify-self-start text-left pl-[1px] text-gray-800 dark:text-gray-100 whitespace-pre">
                    {right}
                </div>
            </div>
            
        </div>
    );
};
