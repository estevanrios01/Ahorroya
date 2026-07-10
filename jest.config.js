module.exports = {
    testEnvironment: "node",
    testMatch: ["**/__tests__/**/*.test.ts"],
    transform: {
        "^.+\\.(ts|js)$": ["@swc/jest"]
    },
    moduleNameMapper: {
        "^@ahorroya/(.*)$": "<rootDir>/packages/$1"
    }
};
