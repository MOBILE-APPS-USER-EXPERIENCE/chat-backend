# ---- Build Stage ----
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json tsconfig.json ./
ENV npm_config_build_from_source=true
RUN npm ci
COPY src ./src
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache python3 make g++
ENV NODE_ENV=production
ENV npm_config_build_from_source=true
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/manual.html ./manual.html
VOLUME /app/data
EXPOSE 8080
CMD ["node", "dist/index.js"]
