# Frontend React: build ra file tinh, roi Caddy phuc vu + tu lay HTTPS
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Client ID Google duoc gan vao code luc build (docker-compose truyen tu file .env)
ARG VITE_GOOGLE_CLIENT_ID=""
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
# VITE_API_BASE_URL de trong -> goi /api cung domain, Caddy chuyen tiep sang backend
RUN npm run build

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
