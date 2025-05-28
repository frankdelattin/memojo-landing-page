#!/bin/bash

# Install dependencies
npm install

# No build step needed for this static site
echo "Memojo Landing Page ready for deployment"

# Create a redirection for the admin page to handle SPA-like routing
echo "/* /index.html 200" > _redirects

# Copy important files to maintain Apple-inspired design structure
mkdir -p dist
cp -r index.html admin css js images backend dist/
