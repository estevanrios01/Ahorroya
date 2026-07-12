module.exports = {
    testEnvironment: "node",
    testMatch: ["**/__tests__/**/*.test.ts"],
    modulePathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
    testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
    watchPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
    transform: {
        "^.+\\.(ts|js)$": ["@swc/jest"]
    },
    moduleNameMapper: {
        "^@ahorroya/(.*)$": "<rootDir>/packages/$1"
    }
};
