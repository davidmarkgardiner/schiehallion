#!/bin/bash

# Install Husky for better Git hooks management
echo "📦 Installing Husky..."
npm install --save-dev husky

# Initialize Husky
npx husky install

# Add hooks to Husky
npx husky add .husky/pre-commit ".githooks/pre-commit"
npx husky add .husky/commit-msg ".githooks/commit-msg"
npx husky add .husky/pre-push ".githooks/pre-push"
npx husky add .husky/prepare-commit-msg ".githooks/prepare-commit-msg"
npx husky add .husky/post-checkout ".githooks/post-checkout"
npx husky add .husky/post-merge ".githooks/post-merge"

echo "✅ Husky installed and configured"
