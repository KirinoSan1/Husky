/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  "preset": "ts-jest",
  "collectCoverageFrom": [
      "src//*.{js,jsx,ts,tsx}",
      "!<rootDir>/node_modules/",
      "!<rootDir>/src//test/**",
      '<rootDir>/src/**/*.{ts,js,jsm,tsx,jsx,tsm}'
  ]
}
