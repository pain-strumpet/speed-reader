import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    // Automatically expose the dev server to the local network for mobile testing
    server: {
        host: true
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
                // We need to cache large files if necessary, but books are stored in IndexedDB.
                maximumFileSizeToCacheInBytes: 5000000
            },
            manifest: {
                name: 'Speed Reader',
                short_name: 'SpeedReader',
                description: 'RSVP Progressive Text Reader with Spatial Context',
                theme_color: '#000000',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                icons: [
                    // Basic placeholder squares for now - the browser requires them for PWA validity
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ]
});
