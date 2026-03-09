import React, { useEffect, useRef } from 'react';
import { useReaderValue } from '../context/ReaderContext';
import { motion, useAnimation } from 'framer-motion';

export const SpatialBackground: React.FC = () => {
    const { activeBook, currentIndex, bgOpacity, bgBlur } = useReaderValue();
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();

    useEffect(() => {
        // Sync the scroll of the background text with the current RSVP index
        if (!containerRef.current || !textRef.current || !activeBook) return;

        // In a highly optimized version, we would calculate the exact offset.
        // For V1, we estimate the scroll progress based on the index percentage.
        const totalWords = activeBook.parsedWords?.length || 1;
        const progress = currentIndex / totalWords;
        
        // Calculate how far up to pull the text.
        // We add a large buffer at the bottom so the last word reaches the 20% mark.
        const textHeight = textRef.current.scrollHeight;
        const containerHeight = containerRef.current.clientHeight;
        const maxScroll = textHeight - (containerHeight * 0.2); 

        const targetY = -(maxScroll * progress);

        // Animate the text layer moving upwards smoothly
        controls.start({
            y: targetY,
            transition: { type: 'tween', ease: 'linear', duration: 0.1 } // Very fast linear tween to keep up with WPM
        });

    }, [currentIndex, activeBook, controls]);

    if (!activeBook) return null;

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden z-0 bg-white dark:bg-black">
            {/* The Dynamic Blur Overlay */}
            <div 
                className="absolute inset-0 z-10 pointer-events-none transition-all duration-200" 
                style={{
                     backdropFilter: `blur(${bgBlur}px)`,
                     WebkitBackdropFilter: `blur(${bgBlur}px)`,
                     backgroundColor: `rgba(var(--bg-rgb, 255, 255, 255), ${bgOpacity / 100})`, // Fallback
                }}
            />
            
            {/* The scrolling text content */}
            <motion.div 
                ref={textRef}
                animate={controls}
                className="w-full max-w-4xl mx-auto px-8 md:px-16 pt-[20vh] pb-[80vh] text-gray-800 dark:text-gray-300 font-serif leading-relaxed text-lg md:text-xl text-justify"
            >
                {/* 
                  For performance on massive books, rendering the full rawText directly 
                  might be heavy on the DOM. If so, we can switch to virtualization later.
                  For now we render the raw text. 
                */}
                <div className="whitespace-pre-wrap">
                    {activeBook.originalText}
                </div>
            </motion.div>
        </div>
    );
};
