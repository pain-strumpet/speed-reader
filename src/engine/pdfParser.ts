import * as pdfjsLib from 'pdfjs-dist';

// We need to configure the worker for pdfjs to function in a browser environment
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function parsePdfFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
                
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                const numPages = pdf.numPages;
                let fullText = '';

                // Extract text page by page
                for (let i = 1; i <= numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    
                    // pdfjs returns text in many small items (sometimes individual letters/words).
                    // We join them with spaces. To preserve paragraphs, we look at the 'transform' Y coordinate
                    // of items, but for a simple V1 RSVP, joining by space is the most robust way to get a continuous stream.
                    let pageText = '';
                    let lastY = -1;

                    for (const item of textContent.items) {
                        if ('str' in item) {
                            // If the Y coordinate changes significantly, it's likely a new line
                            if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
                                pageText += '\n';
                            }
                            pageText += item.str;
                            lastY = item.transform[5];
                        }
                    }

                    fullText += pageText + '\n\n';
                }

                resolve(fullText.trim());

            } catch (error) {
                console.error('Error parsing PDF:', error);
                reject(new Error('Failed to parse PDF file'));
            }
        };

        reader.onerror = () => reject(new Error('Could not read PDF file.'));
        reader.readAsArrayBuffer(file);
    });
}
