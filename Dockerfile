# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies needed for compiling
COPY package*.json ./
RUN npm install

# Copy application source code and build
COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy compiled files from builder
COPY --from=builder /usr/src/app/dist ./dist

# Symlink dist/main.js to dist/src/main.js for backward compatibility
RUN ln -sf /usr/src/app/dist/src/main.js /usr/src/app/dist/main.js || true

# Ensure directory for file uploads exists
RUN mkdir -p uploads

# Expose backend API port
EXPOSE 3000

# Start NestJS backend
CMD ["node", "dist/src/main.js"]
