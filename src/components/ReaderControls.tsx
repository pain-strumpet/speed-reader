import React, { useState } from 'react';
import { useReaderValue } from '../context/ReaderContext';
import { Play, Pause, Settings, X, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

export const ReaderControls: React.FC = () => {
    const { 
        activeBook, isPlaying, togglePlay, currentIndex, setIndex, 
        wpm, setWPM, fontFamily, setFontFamily, fontSize, setFontSize, setActiveBook,
        bgOpacity, setBgOpacity, bgBlur, setBgBlur
    } = useReaderValue();
    
    const [showSettings, setShowSettings] = useState(false);

    if (!activeBook) return null;

    const totalWords = activeBook.parsedWords?.length || 1;
    const progressPercent = (currentIndex / totalWords) * 100;

    const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        setIndex(val);
    };

    const handleJump = (direction: 'back' | 'forward') => {
        const jumpAmount = 25; // Jump roughly 2 sentences
        let target = direction === 'back' ? currentIndex - jumpAmount : currentIndex + jumpAmount;
        target = Math.max(0, Math.min(target, totalWords - 1));
        setIndex(target);
    }

    return (
        <div className="absolute bottom-0 left-0 w-full p-6 z-50 flex flex-col items-center pointer-events-none">
            
            {/* The Main Control Bar */}
            <div className="w-full max-w-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-2xl rounded-2xl p-4 border border-gray-200 dark:border-zinc-800 pointer-events-auto flex flex-col gap-4 transition-opacity duration-300">
                
                {/* Top Row: Info and Quick actions */}
                <div className="flex justify-between items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    <button 
                        onClick={() => setActiveBook(null)}
                        className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white transition-colors"
                        title="Back to Library"
                    >
                        <BookOpen size={16} />
                        <span className="truncate max-w-[150px]">{activeBook.title}</span>
                    </button>
                    
                    <div className="font-mono bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                        {currentIndex.toLocaleString()} / {totalWords.toLocaleString()} 
                        <span className="ml-2 text-gray-400">({progressPercent.toFixed(1)}%)</span>
                    </div>

                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                        title="Settings"
                    >
                        {showSettings ? <X size={20} /> : <Settings size={20} />}
                    </button>
                </div>

                {/* Scrubber */}
                <div className="flex items-center gap-4 w-full">
                    <input 
                        type="range" 
                        min="0" 
                        max={totalWords - 1} 
                        value={currentIndex} 
                        onChange={handleScrub}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-blue-600"
                    />
                </div>

                {/* Playback Controls */}
                <div className="flex justify-center items-center gap-6">
                    <button onClick={() => handleJump('back')} className="p-3 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800">
                         <ChevronLeft size={28} />
                    </button>
                    
                    <button 
                        onClick={togglePlay}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform active:scale-95"
                    >
                        {isPlaying ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
                    </button>

                    <button onClick={() => handleJump('forward')} className="p-3 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800">
                         <ChevronRight size={28} />
                    </button>
                </div>
            </div>

            {/* Settings Flyout */}
            {showSettings && (
                <div className="w-full max-w-3xl mt-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 pointer-events-auto flex flex-col md:flex-row gap-8">
                    
                    {/* Speed Setting */}
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                            Reading Speed
                        </label>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">{wpm}</span>
                            <span className="text-gray-500 font-medium">WPM</span>
                        </div>
                        <input 
                            type="range" min="100" max="1000" step="10" 
                            value={wpm} 
                            onChange={(e) => setWPM(parseInt(e.target.value))}
                            className="w-full accent-blue-600 mb-6"
                        />

                        {/* Background Settings */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                                    Background Blur (A/D)
                                </label>
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 text-xs text-right w-8">Clear</span>
                                    <input 
                                        type="range" min="0" max="60" step="1" 
                                        value={bgBlur} 
                                        onChange={(e) => setBgBlur(parseInt(e.target.value))}
                                        className="flex-1 accent-blue-500"
                                    />
                                    <span className="text-gray-400 text-xs w-8">Max</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                                    Background Dimming (W/S)
                                </label>
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 text-xs text-right w-8">Light</span>
                                    <input 
                                        type="range" min="0" max="100" step="1" 
                                        value={bgOpacity} 
                                        onChange={(e) => setBgOpacity(parseInt(e.target.value))}
                                        className="flex-1 accent-indigo-500"
                                    />
                                    <span className="text-gray-400 text-xs w-8">Dark</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px bg-gray-200 dark:bg-zinc-800" />

                    {/* Font Settings */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                                Typeface
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Dark Courier', 'Times New Roman', 'Roboto', 'Inter'].map(font => (
                                    <button
                                        key={font}
                                        onClick={() => setFontFamily(font)}
                                        className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                                            fontFamily === font 
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300 font-semibold' 
                                            : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                        }`}
                                    >
                                        {font}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                                Display Size
                            </label>
                            <div className="flex items-center gap-4">
                                <span className="text-gray-500 text-sm">A</span>
                                <input 
                                    type="range" min="24" max="96" step="2" 
                                    value={fontSize} 
                                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                                    className="flex-1 accent-gray-500"
                                />
                                <span className="text-gray-500 text-xl font-bold">A</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
