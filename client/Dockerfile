# ========================================================
# Multi-stage Dockerfile for MERN Client (Frontend)
# Stage 1: Build the React application with Webpack
# Stage 2: Serve compiled static files with NGINX
# ========================================================

# --- Stage 1: Build Stage ---
FROM node:18-bullseye-slim AS builder

WORKDIR /usr/src/app

# Set Node OpenSSL compatibility for Webpack 4
ENV NODE_OPTIONS=--openssl-legacy-provider

# Build argument for API URL with standard fallback
ARG API_URL=http://localhost:3000/api
ENV API_URL=$API_URL

# Copy package manifests first for optimal Docker layer caching
COPY package*.json ./

# Install dependencies (use legacy-peer-deps for React 16 compatibility)
RUN npm install --legacy-peer-deps

# Copy client source code
COPY . .

# Ensure .env exists for webpack Dotenv plugin
RUN echo "API_URL=${API_URL}" > .env

# Build production assets into /usr/src/app/dist
RUN npm run build

# --- Stage 2: Production NGINX Runtime ---
FROM nginx:1.25-alpine

# Set working directory to NGINX HTML root
WORKDIR /usr/share/nginx/html

# Clean default NGINX welcome files
RUN rm -rf ./*

# Copy built artifacts from builder stage
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy custom NGINX configuration supporting client-side routing
COPY nginx.conf /etc/nginx/nginx.conf

# Expose HTTP port
EXPOSE 8080

# Health check to ensure NGINX is actively serving the frontend
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Start NGINX in foreground
CMD ["nginx", "-g", "daemon off;"]
