# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Install Yarn
RUN apk add --no-cache yarn

# Copy dependency files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application and build it
COPY . .
RUN yarn build

# Stage 2: Run the application
FROM node:18-alpine

WORKDIR /app

# Copy built files and dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main.js"]