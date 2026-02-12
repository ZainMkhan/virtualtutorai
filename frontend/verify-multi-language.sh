#!/bin/bash
# Multi-Language Implementation Verification Script
# Validates i18n setup and translation files

echo "========================================="
echo "Multi-Language Implementation Verification"
echo "========================================="
echo ""

# Check if i18n config exists
echo "✓ Checking i18n configuration..."
if [ -f "src/i18n/config.ts" ]; then
    echo "  ✓ Found src/i18n/config.ts"
else
    echo "  ✗ Missing src/i18n/config.ts"
    exit 1
fi

# Check translation files
echo ""
echo "✓ Checking translation files..."
LANG_FILES=("en" "es" "fr" "de" "zh" "ja" "ar" "hi")
for lang in "${LANG_FILES[@]}"; do
    if [ -f "src/i18n/locales/$lang.json" ]; then
        SIZE=$(wc -c < "src/i18n/locales/$lang.json")
        echo "  ✓ Found $lang.json ($(numfmt --to=iec-i --suffix=B $SIZE 2>/dev/null || echo $SIZE bytes))"
    else
        echo "  ✗ Missing $lang.json"
        exit 1
    fi
done

# Check LanguageSwitcher component
echo ""
echo "✓ Checking LanguageSwitcher component..."
if [ -f "src/components/shared/LanguageSwitcher.tsx" ]; then
    echo "  ✓ Found LanguageSwitcher.tsx"
else
    echo "  ✗ Missing LanguageSwitcher.tsx"
    exit 1
fi

# Check main.tsx for i18n import
echo ""
echo "✓ Checking main.tsx integration..."
if grep -q "i18n/config" src/main.tsx; then
    echo "  ✓ i18n initialized in main.tsx"
else
    echo "  ✗ i18n not initialized in main.tsx"
    exit 1
fi

# Check for useTranslation usage in key pages
echo ""
echo "✓ Checking component translations..."
for page in "AvatarsBrowse" "Dashboard" "Subscription"; do
    if grep -q "useTranslation" "src/pages/user/${page}.tsx" 2>/dev/null; then
        echo "  ✓ Found useTranslation in ${page}.tsx"
    else
        echo "  ✗ useTranslation not found in ${page}.tsx"
        exit 1
    fi
done

# Check UserMenu component
if grep -q "useTranslation" "src/components/user/UserMenu.tsx" 2>/dev/null; then
    echo "  ✓ Found useTranslation in UserMenu.tsx"
else
    echo "  ✗ useTranslation not found in UserMenu.tsx"
    exit 1
fi

# Validate JSON files
echo ""
echo "✓ Validating JSON syntax..."
for lang in "${LANG_FILES[@]}"; do
    if node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/$lang.json', 'utf8'));" 2>/dev/null; then
        echo "  ✓ Valid JSON: $lang.json"
    else
        echo "  ✗ Invalid JSON: $lang.json"
        exit 1
    fi
done

# Summary
echo ""
echo "========================================="
echo "✓ All Verification Checks Passed!"
echo "========================================="
echo ""
echo "Multi-language implementation is complete and ready for use."
echo ""
echo "Supported languages:"
for lang in "${LANG_FILES[@]}"; do
    echo "  - $lang"
done
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Use LanguageSwitcher component to change languages"
echo "3. Check localStorage for language preference"
echo "========================================="
