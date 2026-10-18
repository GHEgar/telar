import base from '@npmegar/eslint-config';
import react from '@npmegar/eslint-config/react';
import ts from '@npmegar/eslint-config/ts';

export default [
    { ignores: ['**/dist/', 'demo-dist/'] },
    ...base,
    ...react,
    ...ts,
    {
        files: ['packages/glosa/test/disabled.test.tsx', 'packages/abanico/test/radial.test.tsx', 'demo/RadialDemo.tsx'],
        rules: { 'jsx-a11y/no-noninteractive-tabindex': 'off' },
    },
];
