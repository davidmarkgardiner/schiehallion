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
