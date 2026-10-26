# ---- Build Stage ----
FROM node:20-alpine AS build
WORKDIR /app
# better-sqlite3 ist ein natives Modul und braucht einen Compiler-Toolchain
RUN apk add --no-cache python3 make g++
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache python3 make g++
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# manual.html liegt unter src/ und wird von tsc NICHT mitkompiliert
# (lib/manual.ts erwartet sie zur Laufzeit unter process.cwd(), also /app) ->
# deshalb gezielt aus der Build-Stage nach /app/manual.html kopieren.
COPY --from=build /app/src/manual.html ./manual.html
VOLUME /app/data
EXPOSE 8080
CMD ["node", "dist/index.js"]
