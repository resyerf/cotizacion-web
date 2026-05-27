# ── Stage 1: Build ───────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build -- --configuration production

# ── Stage 2: Serve ───────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist/cotizacion-web/browser ./dist

EXPOSE 3004

CMD ["serve", "-s", "dist", "-l", "3004"]
