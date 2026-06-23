# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .

# Stage 2: Production runner stage
FROM node:20-alpine AS runner
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/app.js ./
RUN npm ci --only=production
USER node
EXPOSE 8080
CMD ["node", "app.js"]
