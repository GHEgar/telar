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
            { find: /^@ghegar\/almanaque\/react$/, replacement: pkg('almanaque/src/react/index.ts') },
            { find: /^@ghegar\/almanaque$/, replacement: pkg('almanaque/src/core/index.ts') },
            { find: /^@ghegar\/buzon\/react$/, replacement: pkg('buzon/src/react/index.ts') },
            { find: /^@ghegar\/buzon$/, replacement: pkg('buzon/src/core/index.ts') },
            { find: /^@ghegar\/postigo\/react$/, replacement: pkg('postigo/src/react/index.ts') },
            { find: /^@ghegar\/postigo$/, replacement: pkg('postigo/src/core/index.ts') },
            { find: /^@ghegar\/lanzadera\/react$/, replacement: pkg('lanzadera/src/react/index.ts') },
            { find: /^@ghegar\/lanzadera$/, replacement: pkg('lanzadera/src/core/index.ts') },
            { find: /^@ghegar\/solapa$/, replacement: pkg('solapa/src/index.ts') },
            { find: /^@ghegar\/plomada\/react$/, replacement: pkg('plomada/src/react/index.ts') },
            { find: /^@ghegar\/plomada$/, replacement: pkg('plomada/src/core/index.ts') },
            { find: /^@ghegar\/glosa$/, replacement: pkg('glosa/src/index.ts') },
            { find: /^@ghegar\/abanico$/, replacement: pkg('abanico/src/index.ts') },
            { find: /^@ghegar\/muestrario$/, replacement: pkg('muestrario/src/index.ts') },
        ],
    },
    build: {
        outDir: fileURLToPath(new URL('../demo-dist', import.meta.url)),
        emptyOutDir: true,
    },
});
