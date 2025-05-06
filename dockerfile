# ---- Base Node ----
    FROM node:20.5.1-alpine3.18 AS base
    WORKDIR /opt
    RUN apk update && apk add --no-cache git
    COPY package.json package-lock.json ./
    ENV PATH /opt/node_modules/.bin:$PATH
     
    # ---- Dependencies ----
    FROM base AS dependencies
    RUN npm ci
     
    # ---- Copy Files/Build ----
    FROM dependencies AS build
    COPY . .
    RUN npm run prisma:generate
    RUN npm run build
     
    # --- Release ----
    FROM node:20.5.1-alpine3.18 AS release
    WORKDIR /opt/app
    COPY --from=build /opt ./
    CMD ["npm", "run", "start:prod"]
     