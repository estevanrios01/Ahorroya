module.exports = {
    testEnvironment: "node",
    testMatch: ["**/__tests__/**/*.test.ts"],
    transform: {
        "^.+\\.ts$": ["@swc/jest"]
    },
    moduleNameMapper: {
        "^@ahorroya/(.*)$": "<rootDir>/packages/$1"
    }
};
