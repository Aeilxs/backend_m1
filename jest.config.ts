export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
        '^@dtos$': '<rootDir>/src/common/dtos/index.ts',
        '^@dtos/(.*)$': '<rootDir>/src/common/dtos/$1',
        '^@decorators$': '<rootDir>/src/common/decorators/index.ts',
        '^@decorators/(.*)$': '<rootDir>/src/common/decorators/$1',
    },
    collectCoverageFrom: ['src/**/*.(t|j)s'],
    coverageDirectory: 'coverage',
};
