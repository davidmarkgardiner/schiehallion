module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation
        "style", // Formatting
        "refactor", // Code restructuring
        "test", // Tests
        "chore", // Maintenance
        "perf", // Performance
        "ci", // CI/CD
        "build", // Build system
        "revert", // Revert commit
      ],
    ],
    "scope-enum": [
      2,
      "always",
      [
        "booking",
        "restaurant",
        "admin",
        "auth",
        "ai",
        "payments",
        "ui",
        "api",
        "db",
        "deps",
        "config",
        "tests",
      ],
    ],
    "subject-case": [2, "always", "lower-case"],
    "subject-max-length": [2, "always", 50],
    "body-max-line-length": [2, "always", 72],
    "footer-max-line-length": [2, "always", 72],
  },
};
