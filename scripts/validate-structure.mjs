#!/usr/bin/env node
// Confere a organização por agregado dos módulos da api (apps/api/src/modules/<módulo>):
// - sem pastas por camada técnica (core/, http/, persistence/…): um conceito de
//   negócio por pasta, arquivos distinguidos pelo sufixo (.service.ts, .entity.ts…);
// - arquivos de negócio no máximo em <módulo>/<agregado>/<arquivo>;
// - README só na raiz do módulo.
// shared/ (infraestrutura) e __test__/ ficam de fora das regras.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const MODULES_DIR = 'apps/api/src/modules';
const LAYER_FOLDERS = new Set([
  'application',
  'controller',
  'core',
  'domain',
  'dto',
  'entity',
  'http',
  'infrastructure',
  'persistence',
  'repository',
  'service',
]);
const EXEMPT_FOLDERS = new Set(['shared', '__test__']);
const MAX_DEPTH = 2; // 1 = raiz do módulo, 2 = pasta do agregado

const errors = [];

const walk = (dir, depth) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXEMPT_FOLDERS.has(entry.name)) continue;
      if (LAYER_FOLDERS.has(entry.name)) errors.push(`pasta por camada técnica: ${path}`);
      walk(path, depth + 1);
    } else if (entry.name.toLowerCase() === 'readme.md' && depth > 1) {
      errors.push(`README dentro de agregado: ${path}`);
    } else if (entry.name.endsWith('.ts') && depth > MAX_DEPTH) {
      errors.push(`arquivo fundo demais (máximo <módulo>/<agregado>/<arquivo>): ${path}`);
    }
  }
};

const modules = readdirSync(MODULES_DIR, { withFileTypes: true }).filter(
  (entry) => entry.isDirectory() && !EXEMPT_FOLDERS.has(entry.name),
);
for (const module of modules) {
  walk(join(MODULES_DIR, module.name), 1);
}

if (errors.length > 0) {
  console.error(`Estrutura dos módulos fora do padrão (${errors.length}):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log(`Estrutura dos módulos ok: ${modules.map(({ name }) => name).join(', ')}.`);
