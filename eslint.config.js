import base from '@ghegar/eslint-config';
import react from '@ghegar/eslint-config/react';
import ts from '@ghegar/eslint-config/ts';

export default [
    { ignores: ['**/dist/', 'demo-dist/', 'test-results/', 'playwright-report/'] },
    ...base,
    ...react,
    ...ts,
    {
        files: ['packages/glosa/test/disabled.test.tsx'],
        rules: { 'jsx-a11y/no-noninteractive-tabindex': 'off' },
    },
];
