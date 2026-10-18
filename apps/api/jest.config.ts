import type { Config } from 'jest';

const common: Config = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  moduleNameMapper: { '^@shared/(.*)$': '<rootDir>/src/modules/shared/$1' },
};

const config: Config = {
  projects: [
    {
      ...common,
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/__test__/*.spec.ts'],
    },
    {
      ...common,
      displayName: 'e2e',
      testMatch: ['<rootDir>/src/modules/*/__test__/e2e/*.e2e-spec.ts'],
      setupFiles: ['<rootDir>/src/modules/schedule/__test__/support/test-env.ts'],
    },
  ],
};

export default config;
