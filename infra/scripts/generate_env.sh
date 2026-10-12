#!/bin/bash

# Generate random JWT secret
JWT_SECRET=$(openssl rand -hex 32)

# Copy to root .env
cp .env.example .env

# Replace JWT_SECRET placeholder in root .env
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/change-this-to-a-secure-random-string/$JWT_SECRET/g" .env
else
  sed -i "s/change-this-to-a-secure-random-string/$JWT_SECRET/g" .env
fi

# Create backend .env
mkdir -p backend
cp .env backend/.env

echo ".env files generated successfully with a random JWT secret."
