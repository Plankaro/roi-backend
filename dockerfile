# ---- Base Node ----
    FROM node:20.5.1-alpine3.18 AS base
    WORKDIR /opt
    ENV PATH /opt/node_modules/.bin:$PATH
    
    # ---- Dependencies ----
    FROM base AS dependencies
    # COPY package.json yarn.lock ./
    RUN yarn install --frozen-lockfile
    
    # ---- Copy Files/Build ----
    FROM dependencies AS build
    COPY . .
    RUN yarn prisma:generate
    RUN yarn build
    
    # --- Release ----
    FROM node:20.5.1-alpine3.18 AS release
    WORKDIR /opt/app
    COPY --from=build /opt ./
    CMD ["yarn", "start:prod"]
    