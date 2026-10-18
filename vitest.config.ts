import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const pkg = (path: string): string => fileURLToPath(new URL(`./packages/${path}`, import.meta.url));

export default defineConfig({
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
            { find: /^@npmegar\/nonio\/react$/, replacement: pkg('nonio/src/react/index.ts') },
            { find: /^@npmegar\/nonio$/, replacement: pkg('nonio/src/core/index.ts') },
            { find: /^@npmegar\/pregon\/react$/, replacement: pkg('pregon/src/react/index.ts') },
            { find: /^@npmegar\/pregon$/, replacement: pkg('pregon/src/core/index.ts') },
            { find: /^@npmegar\/sarta\/react$/, replacement: pkg('sarta/src/react/index.ts') },
            { find: /^@npmegar\/sarta$/, replacement: pkg('sarta/src/core/index.ts') },
            { find: /^@npmegar\/grana\/grana\.css$/, replacement: pkg('grana/grana.css') },
            { find: /^@npmegar\/grana\/tonos\.css$/, replacement: pkg('grana/tonos.css') },
            { find: /^@npmegar\/grana$/, replacement: pkg('grana/src/index.ts') },
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
            { test: { name: 'nonio', include: ['packages/nonio/test/**/*.test.{ts,tsx}'] } },
            { test: { name: 'pregon', include: ['packages/pregon/test/**/*.test.{ts,tsx}'] } },
            { test: { name: 'sarta', include: ['packages/sarta/test/**/*.test.{ts,tsx}'] } },
            { test: { name: 'grana', include: ['packages/grana/test/**/*.test.ts'] } },
        ],
    },
});
