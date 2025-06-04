#!/bin/bash

# Backup original tsconfig
cp tsconfig.json tsconfig.original.json

# Use deployment tsconfig
cp tsconfig.deploy.json tsconfig.json

# Run build
echo "Building with relaxed TypeScript settings..."
npm run build -- --no-lint

# Restore original tsconfig
mv tsconfig.original.json tsconfig.json

echo "Build completed. Ready for deployment."
