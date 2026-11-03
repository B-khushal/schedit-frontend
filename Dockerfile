# ==============================================================================
# SCHEDIT FRONTEND DOCKERFILE (PRODUCTION SPA MULTI-STAGE BUILD)
# ==============================================================================

# --- Stage 1: Build Application Artifact ---
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Build arguments for Vite compilation
ARG VITE_APP_URL=https://schedit.in
ARG VITE_API_URL=https://api.schedit.in

ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: Production Nginx Server ---
FROM nginx:1.27-alpine AS runner

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled SPA bundle from builder
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy custom hardened Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -q -O - http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
