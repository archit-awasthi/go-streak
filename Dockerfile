# ─────────────────────────────────────────────
# Stage 1: Build the React + Vite app
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (layer caching)
COPY package*.json ./

# Install dependencies (clean install, respects lock file)
RUN npm ci

# Copy rest of source code
COPY . .

# Build production bundle → /app/dist
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Serve with Nginx
# ─────────────────────────────────────────────
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (handles React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
