import React, { useEffect, useRef } from 'react';
import { useReaderValue } from '../context/ReaderContext';
import { calculateWordDelay } from '../engine/textProcessor';
import { RSVPDisplay } from './RSVPDisplay';
import { SpatialBackground } from './SpatialBackground';

export const ReaderOverlay: React.FC = () => {
    const { activeBook, isPlaying, currentIndex, wpm, pause, togglePlay, setIndex, setWPM } = useReaderValue();
    const timeoutRef = useRef<number | null>(null);

    // Touch gesture state
    const touchStartRef = useRef<{ x: number, y: number } | null>(null);
    const initialConfigRef = useRef<{ wpm: number, index: number, wasPlaying: boolean } | null>(null);
    const isDraggingRef = useRef(false);

    useEffect(() => {
        if (!isPlaying || !activeBook || !activeBook.parsedWords) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            return;
        }

        const totalWords = activeBook.parsedWords.length;
        if (currentIndex >= totalWords) {
            pause();
            return;
        }

        const currentWord = activeBook.parsedWords[currentIndex];
        const delayMS = calculateWordDelay(currentWord, wpm);

        // Schedule the next word
        timeoutRef.current = window.setTimeout(() => {
            setIndex(currentIndex + 1);
        }, delayMS);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isPlaying, currentIndex, activeBook, wpm, pause, setIndex]);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length !== 1) return;
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        initialConfigRef.current = { wpm, index: currentIndex, wasPlaying: isPlaying };
        isDraggingRef.current = false;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStartRef.current || !initialConfigRef.current || !activeBook) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        
        const deltaX = currentX - touchStartRef.current.x;
        const deltaY = currentY - touchStartRef.current.y;

        // If moved more than 15px, we consider it a drag
        if (!isDraggingRef.current && (Math.abs(deltaX) > 15 || Math.abs(deltaY) > 15)) {
            isDraggingRef.current = true;
            if (isPlaying) pause(); // Automatically pause while scrubbing/adjusting
        }

        if (isDraggingRef.current) {
            // Calculate adjustments relative to screen dimensions to seamlessly scale gestures between the Z-Fold 6's inner and outer displays
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            // Only update the axis being dragged most intensely to avoid diagonal input bleed
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // X-axis: Scrubbing (e.g. max 100 words per full horizontal swipe across the current screen width)
                const scrubMultiplier = 100;
                const indexChange = Math.round((deltaX / screenWidth) * scrubMultiplier);
                const newIndex = Math.max(0, Math.min(initialConfigRef.current.index + indexChange, (activeBook.parsedWords?.length || 1) - 1));
                setIndex(newIndex);
            } else {
                // Y-axis: WPM Adjustment. Moving finger UP means deltaY is negative. Up = increase.
                const wpmMultiplier = 400; 
                const wpmChange = Math.round(-(deltaY / screenHeight) * wpmMultiplier);
                const newWPM = Math.max(50, Math.min(initialConfigRef.current.wpm + wpmChange, 1000));
                setWPM(newWPM);
            }
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        // If we were dragging, prevent subsequent synthesized click events from firing togglePlay
        if (isDraggingRef.current) {
            if (e.cancelable) e.preventDefault();
            
            // Resume playback if they were actively reading before the drag started
            if (initialConfigRef.current?.wasPlaying && !isPlaying) {
                togglePlay();
            }
        }
        
        touchStartRef.current = null;
        initialConfigRef.current = null;
        // Keep isDraggingRef truthy for another tick to swallow late clicks
        setTimeout(() => { isDraggingRef.current = false; }, 100);
    };

    return (
        <div className="relative w-full h-screen overflow-hidden text-gray-900 dark:text-gray-100 flex flex-col justify-center items-center">
            {/* Background Layer */}
            <SpatialBackground />
            
            {/* The focused Rapid Serial presentation */}
            <RSVPDisplay />

            {/* Click to Pause invisible overlay */}
            <div 
                className="absolute inset-0 z-20 cursor-pointer touch-none" 
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={(e) => {
                    // Prevent clicking UI controls inside the wrapper from pausing the reader
                    if (e.target === e.currentTarget && !isDraggingRef.current) {
                        togglePlay();
                    }
                }}
            />
        </div>
    );
};
