# Build stage
FROM node:20-bookworm AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
# Use official Playwright image which includes Node.js and browser dependencies
FROM mcr.microsoft.com/playwright:v1.49.1-jammy AS runner

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist

# Install Chromium (even if in base image, ensures version match)
RUN npx playwright install chromium

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/main"]
