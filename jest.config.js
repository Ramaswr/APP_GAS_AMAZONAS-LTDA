const rnModules = [
  'react-native',
  'react-navigation',
  '@react-navigation',
  'expo',
  'expo-font',
  'expo-asset',
  'expo-constants',
  'expo-modules-core',
  'expo-location',
  '@expo',
  '@unimodules',
];

module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
  transformIgnorePatterns: [`node_modules/(?!(${rnModules.join('|')})(/.*)?$)`],
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
};
