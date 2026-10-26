# ---- Build Stage ----
FROM node:20-bookworm-slim AS build
WORKDIR /app
# Nur als Fallback nötig, falls für eine Kombination aus Node-Version/Architektur
# kein passendes Prebuilt existiert und better-sqlite3 selbst kompilieren muss.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

# ---- Production Stage ----
FROM node:20-bookworm-slim AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# Debian/glibc liefert fast immer ein passendes Prebuilt für better-sqlite3 aus,
# daher Toolchain nur temporär installieren und danach wieder entfernen
# (hält das finale Image klein, ohne auf Alpine zurückzufallen).
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && npm ci --omit=dev \
    && apt-get purge -y python3 make g++ \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/manual.html ./manual.html
VOLUME /app/data
EXPOSE 8080
CMD ["node", "dist/index.js"]
