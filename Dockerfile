# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Serve with nginx ────────────────────────────────────────────────
FROM nginx:stable-alpine

# envsubst is needed to inject $PORT at runtime
RUN apk add --no-cache gettext

COPY --from=builder /app/dist /usr/share/nginx/html
# Store as template; entrypoint will substitute $PORT
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Default port for local Docker runs
ENV PORT=80

EXPOSE 80

# Substitute PORT into nginx config then start
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
