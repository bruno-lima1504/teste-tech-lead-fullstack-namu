import nest from '@namu/eslint-config/nest';
import { defineConfig } from 'eslint/config';

export default defineConfig(nest, {
  languageOptions: {
    parserOptions: { tsconfigRootDir: import.meta.dirname },
  },
});
