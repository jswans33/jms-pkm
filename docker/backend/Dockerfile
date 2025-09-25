# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20.11-alpine

FROM node:${NODE_VERSION} AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
RUN npm ci --ignore-scripts

FROM deps AS build
ENV NODE_ENV=production
COPY . .
RUN npm run build --workspace backend

FROM deps AS development
ENV NODE_ENV=development
COPY . .
CMD ["npm", "run", "start:dev-container", "--workspace", "backend"]

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
RUN npm ci --omit=dev --ignore-scripts
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/node_modules ./apps/backend/node_modules
USER node
EXPOSE 3000
CMD ["npm", "run", "start:production", "--workspace", "backend"]
