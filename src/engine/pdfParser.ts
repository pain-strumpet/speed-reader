import * as pdfjsLib from 'pdfjs-dist';

// We need to configure the worker for pdfjs to function in a browser environment
// Import worker directly for local bundling
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure the worker for pdfjs to function in a browser environment using a local file
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function parsePdfFile(file: File): Promise<string> {
    console.log(`Starting PDF parse for: ${file.name}, size: ${file.size} bytes`);
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
                
                console.log('Loading PDF document...');
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                const numPages = pdf.numPages;
                console.log(`PDF loaded. Number of pages: ${numPages}`);
                let fullText = '';

                // Extract text page by page
                for (let i = 1; i <= numPages; i++) {
                    console.log(`Parsing page ${i}/${numPages}...`);
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    
                    let pageText = '';
                    let lastY = -1;

                    for (const item of textContent.items) {
                        if ('str' in item) {
                            if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
                                pageText += '\n';
                            }
                            pageText += item.str;
                            lastY = item.transform[5];
                        }
                    }

                    fullText += pageText + '\n\n';
                }

                console.log('PDF extraction complete.');
                resolve(fullText.trim());

            } catch (error) {
                console.error('Detailed PDF parsing error:', error);
                reject(new Error(error instanceof Error ? `PDF Parse Error: ${error.message}` : 'Failed to parse PDF file'));
            }
        };

        reader.onerror = () => reject(new Error('Could not read PDF file.'));
        reader.readAsArrayBuffer(file);
    });
}
