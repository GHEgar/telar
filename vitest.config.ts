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
        ],
    },
    test: {
        environment: 'happy-dom',
        projects: [
            { test: { name: 'almanaque', include: ['packages/almanaque/test/**/*.test.{ts,tsx}'] } },
            { test: { name: 'buzon', include: ['packages/buzon/test/**/*.test.{ts,tsx}'] } },
            { test: { name: 'postigo', include: ['packages/postigo/test/**/*.test.{ts,tsx}'] } },
        ],
    },
});
