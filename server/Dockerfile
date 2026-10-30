# ========================================================
# Production Dockerfile for MERN Server (Backend API)
# ========================================================

FROM node:18-bullseye-slim

WORKDIR /usr/src/app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests first for optimal layer caching
COPY package*.json ./

# Install production dependencies
RUN npm install --legacy-peer-deps --production

# Copy application code
COPY . .

# Ensure non-root user 'node' owns the application files
RUN chown -R node:node /usr/src/app

# Run container as non-root user for security
USER node

# Expose backend API port
EXPOSE 3000

# Container healthcheck against API route
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api', (res) => process.exit(res.statusCode ? 0 : 1))" || exit 1

# Start the Express server
CMD ["npm", "start"]
