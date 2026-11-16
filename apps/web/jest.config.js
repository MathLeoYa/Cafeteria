module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        module: 'commonjs',
        target: 'ES2017',
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
        moduleResolution: 'node',
        paths: { '@/*': ['./src/*'] },
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
