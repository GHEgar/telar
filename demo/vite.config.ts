import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const pkg = (path: string): string => fileURLToPath(new URL(`../packages/${path}`, import.meta.url));

export default defineConfig({
    root: fileURLToPath(new URL('.', import.meta.url)),
    base: './',
    plugins: [react()],
    resolve: {
        alias: [
            { find: /^@npmegar\/almanaque\/react$/, replacement: pkg('almanaque/src/react/index.ts') },
            { find: /^@npmegar\/almanaque$/, replacement: pkg('almanaque/src/core/index.ts') },
            { find: /^@npmegar\/buzon\/react$/, replacement: pkg('buzon/src/react/index.ts') },
            { find: /^@npmegar\/buzon$/, replacement: pkg('buzon/src/core/index.ts') },
            { find: /^@npmegar\/postigo\/react$/, replacement: pkg('postigo/src/react/index.ts') },
            { find: /^@npmegar\/postigo$/, replacement: pkg('postigo/src/core/index.ts') },
            { find: /^@npmegar\/lanzadera\/react$/, replacement: pkg('lanzadera/src/react/index.ts') },
            { find: /^@npmegar\/lanzadera$/, replacement: pkg('lanzadera/src/core/index.ts') },
            { find: /^@npmegar\/solapa$/, replacement: pkg('solapa/src/index.ts') },
            { find: /^@npmegar\/plomada\/react$/, replacement: pkg('plomada/src/react/index.ts') },
            { find: /^@npmegar\/plomada$/, replacement: pkg('plomada/src/core/index.ts') },
            { find: /^@npmegar\/glosa$/, replacement: pkg('glosa/src/index.ts') },
            { find: /^@npmegar\/abanico$/, replacement: pkg('abanico/src/index.ts') },
            { find: /^@npmegar\/muestrario$/, replacement: pkg('muestrario/src/index.ts') },
            { find: /^@npmegar\/grana\/grana\.css$/, replacement: pkg('grana/grana.css') },
            { find: /^@npmegar\/grana\/tonos\.css$/, replacement: pkg('grana/tonos.css') },
            { find: /^@npmegar\/grana$/, replacement: pkg('grana/src/index.ts') },
        ],
    },
    build: {
        outDir: fileURLToPath(new URL('../demo-dist', import.meta.url)),
        emptyOutDir: true,
    },
});
