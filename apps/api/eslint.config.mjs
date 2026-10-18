import nest from '@namu/eslint-config/nest';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  nest,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    // Fronteiras: de fora de uma área ou módulo, só se importa o index.ts dela.
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@shared/*/*'],
              message: 'Importe pela área (@shared/<área>), não por arquivos internos.',
            },
            {
              group: ['./modules/*/*'],
              message: 'Importe o módulo pelo index (./modules/<módulo>).',
            },
          ],
        },
      ],
    },
  },
);
