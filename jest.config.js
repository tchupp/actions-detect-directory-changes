module.exports = {
    clearMocks: true,
    moduleFileExtensions: ['js', 'ts'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.test.ts',
    ],
    coverageReporters: [
        'json',
        'lcov',
        'text',
        'clover',
        'html',
    ],
    verbose: true
}
