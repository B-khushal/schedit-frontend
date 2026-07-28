# Build stage
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

ARG VITE_APP_URL=https://schedit.in
ARG VITE_API_URL=https://api.schedit.in
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runner stage
FROM nginx:1.25-alpine

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Custom nginx config to redirect all traffic to index.html for Single Page Applications (React Router)
RUN echo 'server { \
  listen 80; \
  location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
