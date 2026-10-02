import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5185,
    open: false,
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        collection: resolve(__dirname, 'collection.html'),
        lookbook: resolve(__dirname, 'lookbook.html'),
        craftsmanship: resolve(__dirname, 'craftsmanship.html'),
        contact: resolve(__dirname, 'contact.html')
      }
    }
  }
});
