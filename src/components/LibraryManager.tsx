import React, { useState, useRef } from 'react';
import { useReaderValue } from '../context/ReaderContext';
import { parseText } from '../engine/textProcessor';
import { parseEpubFile } from '../engine/epubParser';
import { parsePdfFile } from '../engine/pdfParser';
import { BookRecord, Storage } from '../lib/storage';

export const LibraryManager: React.FC = () => {
    const { setActiveBook } = useReaderValue();
    const [isParsing, setIsParsing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        try {
            // Mobile browsers disable the Crypto API over non-HTTPS local networks, so we need a fallback for testing
            const id = typeof crypto !== 'undefined' && crypto.randomUUID 
                ? crypto.randomUUID() 
                : Date.now().toString(36) + Math.random().toString(36).substring(2);
            let originalText = '';
            
            // File Type Routing - Mobile file pickers often send empty strings for file.type on .txt files
            if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.md') || file.name.toLowerCase().endsWith('.txt')) {
                originalText = await file.text();
            } else if (file.name.toLowerCase().endsWith('.epub') || file.type === 'application/epub+zip') {
                originalText = await parseEpubFile(file);
            } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                originalText = await parsePdfFile(file);
            } else {
                throw new Error("Unsupported format");
            }

            const parsedWords = parseText(originalText);

            const newBook: BookRecord = {
                id,
                title: file.name.replace(/\.[^/.]+$/, ""), // strip extension
                originalText,
                parsedWords,
                lastReadIndex: 0,
                addedAt: Date.now()
            };

            await Storage.saveBook(newBook);
            await Storage.registerBookId(newBook.id);
            setActiveBook(newBook);
            
        } catch (err) {
            console.error("Failed to parse file", err);
            alert("Failed to parse this file format.");
        } finally {
            setIsParsing(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input so same file can be selected again if needed
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-950 p-6">
            <h1 className="text-4xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-8 tracking-tight">
                Speed Reader
            </h1>
            
            <label 
                htmlFor="file-upload"
                className={`w-full max-w-2xl p-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-colors duration-200 cursor-pointer
                    border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-gray-400 dark:hover:border-zinc-600
                `}
            >
                <input 
                    id="file-upload"
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect} 
                    className="hidden" 
                    // While mobile OS's ignore this and allow all files anyway, this helps desktop browsers filter the selection dialog
                    accept=".txt,.md,.epub,.pdf"
                />
                
                {isParsing ? (
                    <div className="text-xl text-gray-600 dark:text-gray-400 animate-pulse">
                        Parsing document...
                    </div>
                ) : (
                    <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">
                            Drag & drop a book here
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                            Supports .txt, .md, .epub, .pdf
                        </p>
                    </div>
                )}
            </label>
        </div>
    );
};
