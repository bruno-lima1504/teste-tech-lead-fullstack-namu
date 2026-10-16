import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import nextVitals from 'eslint-config-next/core-web-vitals';
import { base } from './base.js';

export default defineConfig(base, nextVitals, prettier);
