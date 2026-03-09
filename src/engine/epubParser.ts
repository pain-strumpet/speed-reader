import ePub from 'epubjs';

export async function parseEpubFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const bookData = e.target?.result as ArrayBuffer;
                const book = ePub(bookData);
                await book.ready;

                let fullText = '';
                const spineLength = (book.spine as any).length || 0;
                for (let i = 0; i < spineLength; i++) {
                    const item = book.spine.get(i);
                    const doc = await item.load(book.load.bind(book));
                    // Simple text extraction from the DOM of the epub item
                    const textContent = doc.body.textContent || doc.body.innerText;
                    if (textContent) {
                        // Preserve paragraph breaks vaguely
                        fullText += textContent.replace(/\n{2,}/g, '\n\n') + '\n\n';
                    }
                    item.unload();
                }
                
                resolve(fullText.trim());
            } catch (err) {
                console.error("EPUB Parsing Error", err);
                reject(new Error("Failed to parse EPUB file."));
            }
        };
        reader.onerror = () => reject(new Error("Could not read EPUB file."));
        reader.readAsArrayBuffer(file);
    });
}
