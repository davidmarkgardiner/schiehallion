#!/bin/bash
# Git Hooks Setup Script for Schiehallion Hotel Project
# This script sets up comprehensive git hooks for code quality

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Setting up Git hooks for code quality..."

# Create .githooks directory
mkdir -p .githooks

# ============================================
# 1. PRE-COMMIT HOOK
# ============================================
cat > .githooks/pre-commit << 'EOF'
#!/bin/bash

# Pre-commit hook for code quality checks
echo "🔍 Running pre-commit checks..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Track if we should fail the commit
FAIL_COMMIT=0

# 1. Check for debugging statements
echo "Checking for debugging statements..."
DEBUG_STATEMENTS=$(git diff --cached --name-only | xargs grep -l 'console\.log\|debugger\|TODO:\|FIXME:\|XXX:' 2>/dev/null)
if [ ! -z "$DEBUG_STATEMENTS" ]; then
    echo -e "${YELLOW}⚠️  Warning: Found debugging statements or TODOs in:${NC}"
    echo "$DEBUG_STATEMENTS"
    echo "Consider removing them or use 'git commit --no-verify' to skip this check"
fi

# 2. Run ESLint on staged TypeScript/JavaScript files
echo "Running ESLint..."
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx)$')
if [ ! -z "$STAGED_FILES" ]; then
    npx eslint $STAGED_FILES --fix
    ESLINT_EXIT=$?
    
    # Re-add files that were fixed
    for file in $STAGED_FILES; do
        git add $file
    done
    
    if [ $ESLINT_EXIT -ne 0 ]; then
        echo -e "${RED}❌ ESLint failed. Please fix the errors above.${NC}"
        FAIL_COMMIT=1
    else
        echo -e "${GREEN}✅ ESLint passed${NC}"
    fi
fi

# 3. Run Prettier on staged files
echo "Running Prettier..."
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx|css|scss|json|md)$')
if [ ! -z "$STAGED_FILES" ]; then
    npx prettier --write $STAGED_FILES
    
    # Re-add files that were formatted
    for file in $STAGED_FILES; do
        git add $file
    done
    echo -e "${GREEN}✅ Prettier formatting applied${NC}"
fi

# 4. Check TypeScript types
echo "Checking TypeScript types..."
if [ -f "tsconfig.json" ]; then
    npx tsc --noEmit
    TSC_EXIT=$?
    if [ $TSC_EXIT -ne 0 ]; then
        echo -e "${RED}❌ TypeScript type checking failed${NC}"
        FAIL_COMMIT=1
    else
        echo -e "${GREEN}✅ TypeScript types valid${NC}"
    fi
fi

# 5. Check for large files
echo "Checking for large files..."
LARGE_FILES=$(git diff --cached --name-only | xargs -I {} du -k {} 2>/dev/null | awk '$1 > 1000 {print $2}')
if [ ! -z "$LARGE_FILES" ]; then
    echo -e "${YELLOW}⚠️  Warning: Large files detected (>1MB):${NC}"
    echo "$LARGE_FILES"
    echo "Consider using Git LFS for large files"
fi

# 6. Security: Check for potential secrets
echo "Checking for potential secrets..."
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)
for file in $STAGED_FILES; do
    # Check for potential API keys, passwords, etc.
    SECRETS=$(grep -E '(api[_-]?key|apikey|api_secret|password|passwd|pwd|secret|private[_-]?key|token|FIREBASE_|STRIPE_|GEMINI_|OPENAI_)[\s]*=[\s]*["\'][^"\']+["\']' "$file" 2>/dev/null)
    if [ ! -z "$SECRETS" ]; then
        echo -e "${RED}❌ Potential secrets found in $file${NC}"
        echo "$SECRETS"
        FAIL_COMMIT=1
    fi
done

# 7. Check for Firebase rules if they're modified
FIREBASE_RULES=$(git diff --cached --name-only | grep -E '(firestore\.rules|storage\.rules)$')
if [ ! -z "$FIREBASE_RULES" ]; then
    echo "Firebase rules modified. Running validation..."
    if [ -f "firestore.rules" ]; then
        npx firebase emulators:exec --only firestore 'echo "Rules valid"' --project demo-project
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Firestore rules validation failed${NC}"
            FAIL_COMMIT=1
        fi
    fi
fi

# 8. Run unit tests for changed files
echo "Running unit tests for changed files..."
STAGED_TEST_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(test|spec)\.(js|jsx|ts|tsx)$')
STAGED_SOURCE_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx)$' | grep -v -E '\.(test|spec)\.')

if [ ! -z "$STAGED_SOURCE_FILES" ] || [ ! -z "$STAGED_TEST_FILES" ]; then
    # Run tests related to changed files
    npm run test:related -- $STAGED_SOURCE_FILES $STAGED_TEST_FILES
    TEST_EXIT=$?
    if [ $TEST_EXIT -ne 0 ]; then
        echo -e "${RED}❌ Unit tests failed${NC}"
        FAIL_COMMIT=1
    else
        echo -e "${GREEN}✅ Unit tests passed${NC}"
    fi
fi

# 9. Validate JSON files
JSON_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.json$')
if [ ! -z "$JSON_FILES" ]; then
    echo "Validating JSON files..."
    for file in $JSON_FILES; do
        python -m json.tool "$file" > /dev/null 2>&1
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Invalid JSON in $file${NC}"
            FAIL_COMMIT=1
        fi
    done
fi

# 10. Check branch naming convention
BRANCH=$(git rev-parse --abbrev-ref HEAD)
VALID_BRANCH_REGEX='^(main|develop|feature|bugfix|hotfix|release)\/[a-z0-9-]+$|^(main|develop)$'
if ! [[ "$BRANCH" =~ $VALID_BRANCH_REGEX ]]; then
    echo -e "${YELLOW}⚠️  Warning: Branch name '$BRANCH' does not follow naming convention${NC}"
    echo "  Expected format: feature/description, bugfix/description, etc."
fi

# Final decision
if [ $FAIL_COMMIT -eq 1 ]; then
    echo -e "${RED}❌ Pre-commit checks failed. Please fix the issues above.${NC}"
    echo "To bypass these checks (not recommended), use: git commit --no-verify"
    exit 1
else
    echo -e "${GREEN}✅ All pre-commit checks passed!${NC}"
    exit 0
fi
EOF

# ============================================
# 2. COMMIT-MSG HOOK
# ============================================
cat > .githooks/commit-msg << 'EOF'
#!/bin/bash

# Commit message hook for conventional commits
echo "📝 Validating commit message..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Read the commit message
COMMIT_MSG=$(cat "$1")

# Define the conventional commit regex pattern
# Format: <type>(<scope>): <subject>
# Example: feat(booking): add multi-room cart functionality
CONVENTIONAL_REGEX='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\([a-z0-9-]+\))?: .{1,50}'

# Check if commit message follows conventional commits
if ! echo "$COMMIT_MSG" | grep -qE "$CONVENTIONAL_REGEX"; then
    echo -e "${RED}❌ Invalid commit message format!${NC}"
    echo ""
    echo "Commit message must follow Conventional Commits format:"
    echo "  <type>(<scope>): <subject>"
    echo ""
    echo "Types:"
    echo "  feat:     New feature (SCHH-XXX stories)"
    echo "  fix:      Bug fix"
    echo "  docs:     Documentation changes"
    echo "  style:    Code style changes (formatting, etc.)"
    echo "  refactor: Code refactoring"
    echo "  test:     Adding or updating tests"
    echo "  chore:    Maintenance tasks"
    echo "  perf:     Performance improvements"
    echo "  ci:       CI/CD changes"
    echo "  build:    Build system changes"
    echo "  revert:   Revert a previous commit"
    echo ""
    echo "Scopes (examples):"
    echo "  booking, restaurant, admin, auth, ai, payments"
    echo ""
    echo "Examples:"
    echo "  feat(booking): add drag-and-drop room selection"
    echo "  fix(payments): resolve Stripe webhook timeout"
    echo "  docs(api): update booking endpoint documentation"
    echo ""
    echo "Your message: $COMMIT_MSG"
    exit 1
fi

# Check for JIRA ticket reference (SCHH-XXX)
if echo "$COMMIT_MSG" | grep -q "feat\|fix"; then
    if ! echo "$COMMIT_MSG" | grep -qE "SCHH-[0-9]+"; then
        echo -e "${YELLOW}⚠️  Warning: No JIRA ticket reference found (SCHH-XXX)${NC}"
        echo "Consider adding the story number to track this change"
    fi
fi

# Check commit message length
SUBJECT=$(echo "$COMMIT_MSG" | head -1)
if [ ${#SUBJECT} -gt 72 ]; then
    echo -e "${YELLOW}⚠️  Warning: Commit subject is too long (${#SUBJECT} > 72 characters)${NC}"
fi

echo -e "${GREEN}✅ Commit message validation passed!${NC}"
exit 0
EOF

# ============================================
# 3. PRE-PUSH HOOK
# ============================================
cat > .githooks/pre-push << 'EOF'
#!/bin/bash

# Pre-push hook for final quality checks
echo "🚀 Running pre-push checks..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAIL_PUSH=0

# 1. Run full test suite
echo "Running full test suite..."
npm test
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Tests failed. Push aborted.${NC}"
    FAIL_PUSH=1
fi

# 2. Check for merge conflicts markers
echo "Checking for merge conflict markers..."
CONFLICT_MARKERS=$(git diff --name-only origin/$(git rev-parse --abbrev-ref HEAD)..HEAD | xargs grep -l '<<<<<<<\|=======' 2>/dev/null)
if [ ! -z "$CONFLICT_MARKERS" ]; then
    echo -e "${RED}❌ Merge conflict markers found in:${NC}"
    echo "$CONFLICT_MARKERS"
    FAIL_PUSH=1
fi

# 3. Build check
echo "Running build check..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Push aborted.${NC}"
    FAIL_PUSH=1
fi

# 4. Check bundle size
echo "Checking bundle size..."
if [ -f "package.json" ]; then
    npx size-limit 2>/dev/null
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Warning: Bundle size check failed or not configured${NC}"
    fi
fi

# 5. Security audit
echo "Running security audit..."
npm audit --audit-level=high
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Warning: Security vulnerabilities found${NC}"
    echo "Run 'npm audit fix' to resolve"
fi

# 6. License check
echo "Checking licenses..."
npx license-checker --onlyAllow 'MIT;Apache-2.0;BSD-3-Clause;BSD-2-Clause;ISC;CC0-1.0' --excludePrivatePackages 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Warning: Incompatible licenses found${NC}"
fi

# 7. Check if pushing to protected branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
PROTECTED_BRANCHES="main master production"
if echo "$PROTECTED_BRANCHES" | grep -q "$BRANCH"; then
    echo -e "${YELLOW}⚠️  Warning: Pushing directly to protected branch '$BRANCH'${NC}"
    echo "Consider creating a pull request instead"
fi

# Final decision
if [ $FAIL_PUSH -eq 1 ]; then
    echo -e "${RED}❌ Pre-push checks failed. Please fix the issues above.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All pre-push checks passed!${NC}"
    exit 0
fi
EOF

# ============================================
# 4. PREPARE-COMMIT-MSG HOOK (AI-Assisted)
# ============================================
cat > .githooks/prepare-commit-msg << 'EOF'
#!/bin/bash

# Prepare commit message with AI assistance
# This hook can suggest commit messages based on staged changes

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

# Only run for new commits (not amends or merges)
if [ -z "$COMMIT_SOURCE" ]; then
    # Get staged changes summary
    STAGED_DIFF=$(git diff --cached --stat)
    STAGED_FILES=$(git diff --cached --name-only)
    
    # Analyze the type of changes
    if echo "$STAGED_FILES" | grep -q "\.test\.\|\.spec\."; then
        TYPE="test"
        SCOPE="tests"
    elif echo "$STAGED_FILES" | grep -q "^docs/\|README\|\.md$"; then
        TYPE="docs"
        SCOPE="documentation"
    elif echo "$STAGED_FILES" | grep -q "^src/components/"; then
        TYPE="feat"
        SCOPE="ui"
    elif echo "$STAGED_FILES" | grep -q "^src/app/api/"; then
        TYPE="feat"
        SCOPE="api"
    elif echo "$STAGED_FILES" | grep -q "package.*\.json\|\.config\."; then
        TYPE="chore"
        SCOPE="deps"
    else
        TYPE="feat"
        SCOPE="general"
    fi
    
    # Add template to commit message
    cat > "$COMMIT_MSG_FILE" << TEMPLATE
# $TYPE($SCOPE): <summary of changes>
#
# Staged files:
$(echo "$STAGED_FILES" | sed 's/^/# - /')
#
# Commit message format:
# <type>(<scope>): <subject>
#
# Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build
# 
# Remember to:
# - Reference JIRA ticket (SCHH-XXX) for features/fixes
# - Keep subject line under 50 characters
# - Use imperative mood ("add" not "adds" or "added")
# 
# Example: feat(booking): add multi-room cart functionality SCHH-014
TEMPLATE
fi
EOF

# ============================================
# 5. POST-CHECKOUT HOOK
# ============================================
cat > .githooks/post-checkout << 'EOF'
#!/bin/bash

# Post-checkout hook to ensure dependencies are up to date
echo "📦 Checking dependencies..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if package.json has changed
if git diff HEAD@{1} --stat -- package.json | grep -q package.json; then
    echo -e "${YELLOW}📦 package.json has changed. Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies updated${NC}"
fi

# Check if database schema has changed
if git diff HEAD@{1} --stat -- firestore.rules storage.rules | grep -q rules; then
    echo -e "${YELLOW}🔥 Firebase rules have changed${NC}"
    echo "Remember to deploy with: firebase deploy --only firestore:rules,storage:rules"
fi

# Check for new environment variables
if git diff HEAD@{1} --stat -- .env.example | grep -q .env.example; then
    echo -e "${YELLOW}🔑 Environment variables may have changed${NC}"
    echo "Check .env.example for new required variables"
fi
EOF

# ============================================
# 6. POST-MERGE HOOK
# ============================================
cat > .githooks/post-merge << 'EOF'
#!/bin/bash

# Post-merge hook to handle dependency updates and migrations
echo "🔄 Running post-merge tasks..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Install/update dependencies if package.json changed
if git diff HEAD@{1} --stat -- package.json | grep -q package.json; then
    echo -e "${YELLOW}📦 package.json changed. Updating dependencies...${NC}"
    npm install
fi

# Run database migrations if they exist
if [ -d "migrations" ] && git diff HEAD@{1} --stat -- migrations/ | grep -q migrations; then
    echo -e "${YELLOW}🗄️  Database migrations detected${NC}"
    echo "Run migrations with: npm run migrate"
fi

# Clear caches
echo "Clearing caches..."
npm run clear-cache 2>/dev/null || echo "No cache clear script found"

echo -e "${GREEN}✅ Post-merge tasks completed${NC}"
EOF

# Make all hooks executable
chmod +x .githooks/*

# ============================================
# Setup Husky for better hook management
# ============================================
cat > setup-husky.sh << 'EOF'
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
EOF

chmod +x setup-husky.sh

# ============================================
# Create .gitmessage template
# ============================================
cat > .gitmessage << 'EOF'
# <type>(<scope>): <subject> SCHH-XXX

# <body>
# Explain what and why, not how

# <footer>
# Closes: #issue
# Breaking Changes: description

# Types: feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert
# Scope: booking|restaurant|admin|auth|ai|payments|ui|api|db
# Subject: imperative mood, max 50 chars
# Body: wrap at 72 chars
# Footer: references, breaking changes
EOF

# ============================================
# Create lint-staged configuration
# ============================================
cat > .lintstagedrc.json << 'EOF'
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    "jest --bail --findRelatedTests"
  ],
  "*.{css,scss,less}": [
    "prettier --write"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ],
  "*.{graphql,gql}": [
    "prettier --write"
  ],
  "firestore.rules": [
    "firebase emulators:exec --only firestore 'echo Rules valid' --project demo-project"
  ],
  "package.json": [
    "npm audit fix --audit-level=high"
  ]
}
EOF

# ============================================
# Create commitlint configuration
# ============================================
cat > commitlint.config.js << 'EOF'
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting
        'refactor', // Code restructuring
        'test',     // Tests
        'chore',    // Maintenance
        'perf',     // Performance
        'ci',       // CI/CD
        'build',    // Build system
        'revert'    // Revert commit
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'booking',
        'restaurant',
        'admin',
        'auth',
        'ai',
        'payments',
        'ui',
        'api',
        'db',
        'deps',
        'config',
        'tests'
      ]
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 50],
    'body-max-line-length': [2, 'always', 72],
    'footer-max-line-length': [2, 'always', 72]
  }
};
EOF

# ============================================
# Update package.json scripts
# ============================================
cat > update-package-scripts.js << 'EOF'
const fs = require('fs');
const package = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add useful scripts
package.scripts = {
  ...package.scripts,
  "prepare": "husky install",
  "pre-commit": ".githooks/pre-commit",
  "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
  "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
  "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,css,scss,md}\"",
  "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,css,scss,md}\"",
  "type-check": "tsc --noEmit",
  "test:related": "jest --bail --findRelatedTests",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "validate": "npm run lint && npm run type-check && npm run test",
  "clear-cache": "rm -rf .next && rm -rf node_modules/.cache"
};

fs.writeFileSync('package.json', JSON.stringify(package, null, 2));
console.log('✅ package.json scripts updated');
EOF

# Run the package.json updater
node update-package-scripts.js
rm update-package-scripts.js

# ============================================
# Install required dependencies
# ============================================
echo "📦 Installing required npm packages..."
npm install --save-dev \
  husky \
  lint-staged \
  @commitlint/cli \
  @commitlint/config-conventional \
  eslint \
  prettier \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-config-prettier \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  size-limit \
  @size-limit/preset-next \
  license-checker

# ============================================
# Configure Git to use the hooks
# ============================================
git config core.hooksPath .githooks
git config commit.template .gitmessage

echo ""
echo "✅ Git hooks setup complete!"
echo ""
echo "Hooks installed:"
echo "  • pre-commit: Linting, formatting, type checking, security checks"
echo "  • commit-msg: Conventional commit format validation"
echo "  • pre-push: Full test suite, build check, security audit"
echo "  • prepare-commit-msg: AI-assisted commit message suggestions"
echo "  • post-checkout: Dependency updates, environment checks"
echo "  • post-merge: Automatic dependency installation, cache clearing"
echo ""
echo "To use Husky instead of direct Git hooks, run:"
echo "  ./setup-husky.sh"
echo ""
echo "Commit format: <type>(<scope>): <subject> SCHH-XXX"
echo "Example: feat(booking): add drag-and-drop room selection SCHH-013"
EOF

chmod +x git-hooks-setup.sh

# Create additional helper script for AI-assisted commits
cat > ai-commit-helper.sh << 'EOF'
#!/bin/bash

# AI-Assisted Commit Helper
# This script analyzes your changes and suggests a commit message

echo "🤖 Analyzing your changes..."

# Get the diff
DIFF=$(git diff --cached)
FILES=$(git diff --cached --name-only)
STATS=$(git diff --cached --stat)

# Analyze changes
if [ -z "$FILES" ]; then
    echo "❌ No staged changes found. Stage changes with 'git add'"
    exit 1
fi

echo ""
echo "📝 Changed files:"
echo "$FILES" | sed 's/^/  - /'
echo ""

# Determine commit type and scope
TYPE="feat"
SCOPE="general"

# Analyze file patterns
if echo "$FILES" | grep -q "test\|spec"; then
    TYPE="test"
    SCOPE="tests"
elif echo "$FILES" | grep -q "^docs/\|README"; then
    TYPE="docs"
    SCOPE="documentation"
elif echo "$FILES" | grep -q "^\.github/\|^\.circleci/"; then
    TYPE="ci"
    SCOPE="ci"
elif echo "$FILES" | grep -q "package.*json\|yarn\.lock"; then
    TYPE="chore"
    SCOPE="deps"
elif echo "$FILES" | grep -q "\.css\|\.scss\|tailwind"; then
    TYPE="style"
    SCOPE="ui"
fi

# Specific path analysis for hotel project
if echo "$FILES" | grep -q "src/components/booking"; then
    SCOPE="booking"
elif echo "$FILES" | grep -q "src/components/restaurant"; then
    SCOPE="restaurant"
elif echo "$FILES" | grep -q "src/components/admin"; then
    SCOPE="admin"
elif echo "$FILES" | grep -q "src/app/api/"; then
    SCOPE="api"
elif echo "$FILES" | grep -q "firestore\.rules\|storage\.rules"; then
    SCOPE="security"
fi

# Generate suggestions
echo "🎯 Suggested commit type: $TYPE"
echo "📦 Suggested scope: $SCOPE"
echo ""
echo "📝 Suggested commit messages:"
echo "  1. $TYPE($SCOPE): implement changes to $(echo $FILES | head -1 | xargs basename)"
echo "  2. $TYPE($SCOPE): update $(echo $FILES | wc -l) files for improved functionality"
echo "  3. $TYPE($SCOPE): add new features to $(echo $FILES | grep -o '[^/]*$' | head -1)"
echo ""
echo "💡 Remember to:"
echo "  • Reference JIRA ticket (SCHH-XXX) if applicable"
echo "  • Use imperative mood (add, not adds or added)"
echo "  • Keep under 50 characters"
echo ""
echo "Enter your commit message (or press Ctrl+C to cancel):"
read -p "> " COMMIT_MSG

if [ ! -z "$COMMIT_MSG" ]; then
    git commit -m "$COMMIT_MSG"
else
    echo "❌ Commit cancelled"
fi
EOF

chmod +x ai-commit-helper.sh

echo "✅ Git hooks setup complete!"
echo "Run ./git-hooks-setup.sh to install all hooks"