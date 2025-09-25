# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20.11

FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/
RUN npm ci --ignore-scripts

FROM deps AS build
ENV NODE_ENV=production
COPY . .
RUN npm run build --workspace frontend

FROM deps AS development
ENV NODE_ENV=development
COPY . .
CMD ["npm", "run", "dev", "--workspace", "frontend"]

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/
RUN npm ci --omit=dev --ignore-scripts
COPY --from=build /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=build /app/apps/frontend/public ./apps/frontend/public
COPY --from=build /app/apps/frontend/node_modules ./apps/frontend/node_modules
USER node
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "frontend"]
