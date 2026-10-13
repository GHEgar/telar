import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const pkg = (path: string): string => fileURLToPath(new URL(`./packages/${path}`, import.meta.url));

export default defineConfig({
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
    test: {
        environment: 'happy-dom',
        projects: [
            { test: { name: 'almanaque', include: ['packages/almanaque/test/**/*.test.{ts,tsx}'] } },
            { test: { name: 'buzon', include: ['packages/buzon/test/**/*.test.{ts,tsx}'] } },
            { test: { name: 'postigo', include: ['packages/postigo/test/**/*.test.{ts,tsx}'] } },
            { test: { name: 'lanzadera', include: ['packages/lanzadera/test/**/*.test.{ts,tsx}'] } },
            { test: { name: 'solapa', include: ['packages/solapa/test/**/*.test.{ts,tsx}'] } },
            { test: { name: 'plomada', include: ['packages/plomada/test/**/*.test.{ts,tsx}'] } },
            { test: { name: 'glosa', include: ['packages/glosa/test/**/*.test.{ts,tsx}'] } },
            { test: { name: 'abanico', include: ['packages/abanico/test/**/*.test.{ts,tsx}'] } },
            { test: { name: 'muestrario', include: ['packages/muestrario/test/**/*.test.{ts,tsx}'] } },
        ],
    },
});
