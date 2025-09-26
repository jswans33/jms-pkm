import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import preferArrow from 'eslint-plugin-prefer-arrow';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

const tsParserOptions = {
  ecmaVersion: 'latest',
  sourceType: 'module',
  // Use new Project Service API (typescript-eslint v8+)
  projectService: true,
  tsconfigRootDir: import.meta.dirname,
};

export default [
  {
    ignores: [
      '**/node_modules/**',
      'storage/**',
      '**/dist/**',
      '**/generated/**',
      'generated/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: tsParserOptions,
    },
    plugins: {
      '@typescript-eslint': typescript,
      import: importPlugin,
      jest: jestPlugin,
      'prefer-arrow': preferArrow,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: true,
        },
      },
    },
    rules: {
      // COMPLEXITY LIMITS (ULTRA STRICT)
      complexity: ['error', { max: 8 }],
      'max-lines-per-function': ['error', { max: 30, skipComments: true, skipBlankLines: true }],
      'max-params': ['error', 4],
      'max-depth': ['error', 4],
      'max-nested-callbacks': ['error', 3],

      // TYPESCRIPT STRICT RULES
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/prefer-readonly': 'error',
      // Disabled: This rule is too strict for practical use with DI, external libraries, and Date objects
      // '@typescript-eslint/prefer-readonly-parameter-types': 'error',
      '@typescript-eslint/explicit-member-accessibility': 'error',

      // NO MAGIC NUMBERS/STRINGS
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true,
          ignoreEnums: true,
          ignore: [0, 1, -1, 2, 10, 100, 1000],
        },
      ],
      'no-magic-numbers': 'off', // Use TypeScript version

      // PREFER MODERN PATTERNS
      'prefer-arrow/prefer-arrow-functions': [
        'error',
        {
          disallowPrototype: true,
          singleReturnOnly: false,
          classPropertiesAllowed: false,
        },
      ],
      'prefer-const': 'error',
      'prefer-template': 'error',
      'no-var': 'error',

      // IMPORT RULES
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-cycle': 'error',
      'import/no-self-import': 'error',
      'import/no-unused-modules': 'error',

      // CLEAN CODE RULES
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-undef': 'off',

      // PROMISE HANDLING
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/promise-function-async': 'error',

      // NAMING CONVENTIONS
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        {
          selector: 'method',
          format: ['camelCase'],
        },
        {
          selector: 'property',
          format: ['camelCase', 'UPPER_CASE'],
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: tsParserOptions,
      globals: globals.jest,
    },
    plugins: {
      '@typescript-eslint': typescript,
      jest: jestPlugin,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      '@typescript-eslint/no-magic-numbers': 'off',
      'max-lines-per-function': 'off',
    },
    settings: {
      jest: {
        version: 30,
      },
    },
  },
  prettier,
];
